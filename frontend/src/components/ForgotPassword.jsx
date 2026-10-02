import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [formData, setFormData] = useState({ email: '', newPassword: '', confirmNewPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: 'error', text: 'លេខសម្ងាត់ថ្មីទាំងពីរប្រអប់មិនដូចគ្នាទេ!' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/forgot-password', {
        email: formData.email,
        new_password: formData.newPassword,
        confirm_new_password: formData.confirmNewPassword
      });

      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: response.data.message });
        setTimeout(() => {
          navigate('/login'); // បញ្ជូនទៅទំព័រ Login វិញក្រោយជោគជ័យ ៣ វិនាទី
        }, 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'មានបញ្ហាក្នុងការប្តូរលេខសម្ងាត់!';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #3b5998', backgroundColor: '#2e3b5e', color: '#ffffff', outline: 'none', paddingRight: '40px'
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', backgroundColor: '#242f4d', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', fontFamily: 'Arial, sans-serif', color: '#ecebeb' }}>
      <h2 style={{ textAlign: 'center', color: '#ffffff', marginBottom: '25px', borderBottom: '2px solid #3b5998', paddingBottom: '10px' }}>🔒 Reset Password</h2>

      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#e2f0d9' : '#fce4d6', color: message.type === 'success' ? '#385723' : '#c65911', textAlign: 'center', fontWeight: 'bold' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Your Registered Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>New Password:</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleChange} required style={inputStyle} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ccc' }}>
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Confirm New Password:</label>
          <input type={showPassword ? "text" : "password"} name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} required style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          {loading ? 'កំពុងរក្សាទុក...' : 'Reset Password'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#ccc', textAlign: 'center' }}>
        Remembered your password? <Link to="/login" style={{ color: '#0088cc', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
