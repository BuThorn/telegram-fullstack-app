import hashlib
import hmac
import os
import random
import string
from io import BytesIO

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from captcha.image import ImageCaptcha


# ================================
# 1. DATABASE CONFIGURATION (MySQL)
# ================================
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "admin")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "databace")

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

SECRET_KEY = os.getenv("SECRET_KEY", "telegram-fullstack-secret-key")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# ===========================
# 2. DATABASE MODELS
# ===========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")


Base.metadata.create_all(bind=engine)


def ensure_default_admin_user() -> None:
    """Create or repair the default admin account used for the dashboard login flow."""
    admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin123!")
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == admin_email).first()
        if not user:
            db.add(
                User(
                    full_name="System Administrator",
                    email=admin_email,
                    hashed_password=pwd_context.hash(admin_password),
                    role="admin",
                )
            )
            db.commit()
            return

        if user.role != "admin":
            user.role = "admin"
            db.commit()

        if not pwd_context.verify(admin_password, user.hashed_password):
            user.hashed_password = pwd_context.hash(admin_password)
            db.commit()
    finally:
        db.close()


ensure_default_admin_user()


# ===========================
# 3. DATABASE DEPENDENCY
# ===========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===============================
# 4. TOKEN & AUTHORIZATION HELPERS
# ===============================
def create_user_token(user: User) -> str:
    """Create a secure session token using HMAC-SHA256."""
    payload = f"{user.id}:{user.email}:{user.role}"
    signature = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"


def get_current_user_from_token(authorization: str | None, db: Session) -> User:
    """Validate a bearer token and return the current authenticated user."""
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")

    scheme, _, token_value = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token_value:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token.")

    parts = token_value.split(":")
    if len(parts) != 4:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token.")

    user_id, email, role, signature = parts
    expected_signature = hmac.new(
        SECRET_KEY.encode(),
        f"{user_id}:{email}:{role}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session token is invalid.")

    user = db.query(User).filter(User.id == int(user_id), User.email == email, User.role == role).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User session not found.")

    return user


def require_admin(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> User:
    """Allow only admin users to access protected endpoints."""
    user = get_current_user_from_token(authorization, db)
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return user


# =================================
# 5. FASTAPI CORE & CORS MIDDLEWARE
# =================================
app = FastAPI(title="Telegram Automation - API Control Center")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-captcha-id"],
)

captcha_store = {}


# =====================================
# 6. PYDANTIC REQUEST VALIDATION SCHEMAS
# =====================================
class UserRegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str
    captcha_id: str
    captcha_code: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr
    new_password: str
    confirm_new_password: str


class UpdateRoleSchema(BaseModel):
    role: str


# ====================================
# 7. AUTHENTICATION ENDPOINTS
# ====================================

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Telegram API is running."}


@app.get("/api/auth/captcha")
def generate_captcha_image():
    """Generate a 5-character captcha image."""
    captcha_text = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    captcha_id = "".join(random.choices(string.ascii_lowercase + string.digits, k=10))
    captcha_store[captcha_id] = captcha_text

    image = ImageCaptcha(width=280, height=90)
    data = image.generate(captcha_text)

    return StreamingResponse(
        BytesIO(data.read()),
        media_type="image/png",
        headers={"x-captcha-id": captcha_id},
    )


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterSchema, db: Session = Depends(get_db)):
    """Register a new user account."""
    saved_code = captcha_store.get(payload.captcha_id)
    if not saved_code or saved_code != payload.captcha_code.upper():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha code is invalid or expired.",
        )
    captcha_store.pop(payload.captcha_id, None)

    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password confirmation does not match.",
        )

    email = payload.email.lower()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already in use.",
        )

    hashed_pwd = pwd_context.hash(payload.password)
    new_user = User(full_name=payload.full_name, email=email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()

    return {"status": "success", "message": "Registration was successful."}


@app.post("/api/auth/login")
def login_user(payload: UserLoginSchema, db: Session = Depends(get_db)):
    """Authenticate a user and return a session token."""
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
        )

    token = create_user_token(user)

    return {
        "status": "success",
        "message": "Login successful.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "token": token,
        },
    }


@app.post("/api/auth/forgot-password")
def forgot_password(payload: ForgotPasswordSchema, db: Session = Depends(get_db)):
    """Change a forgotten password for an existing account."""
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email.",
        )

    if payload.new_password != payload.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password confirmation does not match.",
        )

    user.hashed_password = pwd_context.hash(payload.new_password)
    db.commit()

    return {"status": "success", "message": "Password changed successfully. Please log in again."}


# =======================================
# 8. ADMIN USER MANAGEMENT ENDPOINTS
# =======================================

@app.get("/api/admin/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Return all users for admins only."""
    del current_user
    users = db.query(User).all()
    return [{"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role} for user in users]


@app.put("/api/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: UpdateRoleSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a user's role for admin users only."""
    del current_user
    user_to_update = db.query(User).filter(User.id == user_id).first()
    if not user_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if payload.role not in ["user", "admin"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role value.")

    user_to_update.role = payload.role
    db.commit()
    return {"status": "success", "message": f"Role updated for {user_to_update.full_name} to {payload.role.upper()}."}


@app.delete("/api/admin/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a user for admin users only."""
    del current_user
    user_to_update = db.query(User).filter(User.id == user_id).first()
    if not user_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(user_to_update)
    db.commit()
    return {"status": "success", "message": f"User {user_to_update.full_name} deleted successfully."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
