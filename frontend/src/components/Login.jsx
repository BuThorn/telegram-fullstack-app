import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.status === 'success') {
        const user = response.data.user || {};
        const nextUser = {
          ...user,
          token: user.token || null,
        };

        localStorage.setItem('user', JSON.stringify(nextUser));
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Resusable Dark UI Styles 
  const inputStyle = {
    width: '100%',
    padding: '10px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid #2e3b5e',
    backgroundColor: '#2e3b5e',
    color: '#ffffff',
    outline: 'none',
    paddingRight: '40px'
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#aeaeae', marginBottom: '20px' }}>Log In</h2>

      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#e2f0d9' : '#fce4d6', color: message.type === 'success' ? '#385723' : '#c65911', textAlign: 'center', border: '1px solid #ccc' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          {loading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Log In'}
        </button>

         <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <Link to="/forgot-password" style={{ color: '#dfdfdf', textDecoration: 'none', fontSize: '13px' }}>
            Forgot Password?
          </Link>
        </div>

        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Don't have an account? <Link to="/register" style={{ color: '#0088cc', textDecoration: 'none' }}>Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
