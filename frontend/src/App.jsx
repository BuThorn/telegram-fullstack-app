import ForgotPassword from './components/ForgotPassword';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { UserProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';
import { ChevronDown, DollarSign, Home, LogOut, Mail, Moon, Sun, UserCircle } from 'lucide-react';
import appLogo from './assets/icon-128x128.png';

import './components/Dashboard.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const checkUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      } catch {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const appSurfaceStyle = {
    background: isDarkMode ? 'var(--color-5)' : 'var(--color-1)',
    color: isDarkMode ? '#f7f5ef' : '#1a1b1d',
  };

  const headerStyle = {
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(42,45,47,0.12)',
    background: isDarkMode ? 'rgba(23,25,27,0.9)' : 'rgba(255,255,255,0.8)',
    boxShadow: isDarkMode ? 'none' : '0 8px 22px rgba(42,45,47,0.08)',
  };

  const navStyle = {
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(42,45,47,0.12)',
    background: isDarkMode ? 'rgba(42,45,47,0.9)' : 'rgba(255,255,255,0.8)',
    boxShadow: isDarkMode ? '0 12px 30px rgba(0,0,0,0.2)' : '0 12px 30px rgba(42,45,47,0.08)',
  };

  const navLinkStyle = {
    color: isDarkMode ? '#e6e4dd' : '#1b1d1f',
    background: 'transparent',
  };

  const navLinkHoverStyle = {
    background: isDarkMode ? 'rgba(240, 201, 75, 0.12)' : 'rgba(240, 201, 75, 0.2)',
    color: isDarkMode ? '#fff7d6' : '#1b1d1f',
  };

  const controlStyle = {
    background: isDarkMode ? 'var(--color-4)' : '#f5f4f0',
    color: isDarkMode ? '#f7f5ef' : '#1b1d1f',
    borderColor: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(42,45,47,0.12)',
  };

  const profileStyle = {
    background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
    color: isDarkMode ? '#f7f5ef' : '#1b1d1f',
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(42,45,47,0.12)',
  };

  const footerStyle = {
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(42,45,47,0.12)',
    background: isDarkMode ? 'rgba(23,25,27,0.85)' : 'rgba(255,255,255,0.75)',
    color: isDarkMode ? '#dfe6e8' : '#1b1d1f',
  };

  const handleLogOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="app-shell min-h-screen transition-colors duration-300" style={appSurfaceStyle}>
        <header className="border-b backdrop-blur-sm" style={headerStyle}>
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 py-3.5">
            <img src={appLogo} alt="Thorng logo" className="h-9 w-9 rounded-xl object-cover shadow-[0_0_18px_rgba(240,201,75,0.35)]" />
            <span className="text-lg font-bold tracking-[0.18em]" style={{ color: isDarkMode ? '#f8f8f5' : '#1b1d1f' }}>THORNG</span>
          </div>
        </header>

        <nav className="border-b shadow-lg backdrop-blur-sm" style={navStyle}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <a href="#" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-inset transition" style={{ ...navLinkStyle, background: 'rgba(240, 201, 75, 0.14)', borderColor: 'rgba(240, 201, 75, 0.35)', color: '#1b1d1f' }}>
                <Home size={18} />
                <span>Home</span>
              </a>
              <a href="#" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition" style={navLinkStyle} onMouseEnter={(e) => Object.assign(e.currentTarget.style, navLinkHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent', color: isDarkMode ? '#e6e4dd' : '#1b1d1f' })}>
                <DollarSign size={18} />
                <span>Plans & Pricing</span>
              </a>
              <a href="#" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition" style={navLinkStyle} onMouseEnter={(e) => Object.assign(e.currentTarget.style, navLinkHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent', color: isDarkMode ? '#e6e4dd' : '#1b1d1f' })}>
                <Mail size={18} />
                <span>Contact Us</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition"
                style={controlStyle}
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Moon size={17} /> : <Sun size={17} style={{ color: '#d79b00' }} />}
              </button>

              <button type="button" className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition" style={profileStyle}>
                <UserCircle size={18} />
                <span>{user?.full_name || 'BunThorng'}</span>
                <ChevronDown size={16} />
              </button>

              {user && (
                <button
                  type="button"
                  onClick={handleLogOut}
                  title="Log out"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition"
                  style={{ background: '#d94a3d' }}
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
              path="/dashboard"
              element={
                <UserProtectedRoute>
                  <Dashboard />
                </UserProtectedRoute>
              }
            />

            <Route
              path="/admin-panel"
              element={
                <AdminProtectedRoute>
                  <Dashboard />
                </AdminProtectedRoute>
              }
            />
          </Routes>
        </main>

        <footer className="border-t px-4 py-5 text-center text-sm" style={footerStyle}>
          <div>© {new Date().getFullYear()} Bot Control Center. រក្សាសិទ្ធិគ្រប់យ៉ាង។</div>
          <div className="mt-1 text-xs" style={{ color: isDarkMode ? '#b7c0c7' : '#4c5056' }}>Powered by FastAPI & React</div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
