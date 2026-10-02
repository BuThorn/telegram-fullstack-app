import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    captchaCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  
  // ភ្នែកសម្រាប់ប្រអប់ទី១
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  // ភ្នែកសម្រាប់ប្រអប់ទី២

  const [captchaUrl, setCaptchaUrl] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  
  const loadCaptcha = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/captcha', {
        responseType: 'blob'
      });

      setCaptchaId(response.headers['x-captcha-id']);
      setCaptchaUrl(URL.createObjectURL(response.data));
    } catch (error) {
      console.error("Error loading captcha:", error);
    }
  };
   
  useEffect(() => { loadCaptcha(); }, []);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'លេខសម្ងាត់បញ្ជាក់មិនផ្ទៀងផ្ទាត់គ្នាទេ!' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        captcha_id: captchaId,
        captcha_code: formData.captchaCode
      });

      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: '🌟 ចុះឈ្មោះគណនីបានជោគជ័យ!' });
        setFormData({ fullName: '', email: '', password: '', confirmPassword: '', captchaCode: '' });
        loadCaptcha();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'មានបញ្ហាក្នុងការចុះឈ្មោះ!';
      setMessage({ type: 'error', text: errorMsg });
      loadCaptcha();
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
    border: '1px solide #2e3b5e',
    color: '#ffffff',
    outline: 'none',
    paddingRight: '40px'
  };

  const eyeButtonStyle = {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ccc', outline: 'none'
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', backgroundColor: '#242f4d', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', color: '#ecebeb' }}>
      <h2 style={{ textAlign: 'center', color: '#ffffff', marginBottom: '25px' , borderBottom: '2px solid #3b5998', paddingBottom: '10px'  }}>Register</h2>

      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#e2f0d9' : '#fce4d6', color: message.type === 'success' ? '#385723' : '#c65911', textAlign: 'center', border: '1px solid #ccc' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Full Name:</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' , fontSize: '14px' }}>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm Password:</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Captcha:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            {captchaUrl && <img src={captchaUrl} alt="Captcha" style={{ height: '45px', border: '1px solid #ccc', borderRadius: '4px' }} />}
            <button type="button" onClick={loadCaptcha} style={{ padding: '5px 10px', cursor: 'pointer', height: '35px' }}>🔄 ប្តូរ</button>
          </div>
          <input type="text" name="captchaCode" placeholder="វាយលេខក្នុងរូបភាពខាងលើ" value={formData.captchaCode} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#0088cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          {loading ? 'កំពុងរក្សាទុក...' : 'Register'}
        </button>

        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#0088cc', textDecoration: 'none' }}>Log In</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
