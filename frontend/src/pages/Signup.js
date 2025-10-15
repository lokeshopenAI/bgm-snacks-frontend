import React, { useState } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';

const colors = {
  primary: '#d2691e',
  border: '#e0e0e0',
  error: '#d9534f'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '4px',
  border: `1px solid ${colors.border}`,
  fontSize: '1rem'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const containerStyle = {
  maxWidth: '400px',
  margin: '60px auto',
  padding: '30px',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  backgroundColor: '#fff',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const errorTextStyle = {
  color: colors.error,
  marginBottom: '15px',
  fontWeight: '600'
};

const Signup = () => {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const submitSignup = async () => {
    try {
      await API.post('/api/auth/signup', form);  // ✅ Updated path
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  const verifyOtp = async () => {
    try {
      await API.post('/api/auth/verify-otp', { email: form.email, otp });  // ✅ Updated path
      alert('Signup successful. Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    }
  };

  return (
    <div style={containerStyle}>
      {!otpSent ? (
        <>
          <h2 style={{ marginBottom: '20px', color: colors.primary }}>Signup</h2>
          {error && <p style={errorTextStyle}>{error}</p>}
          <input placeholder="Name" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
          <input placeholder="Email" name="email" value={form.email} onChange={handleChange} style={inputStyle} />
          <input placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
          <input type="password" placeholder="Password" name="password" value={form.password} onChange={handleChange} style={inputStyle} />
          <button onClick={submitSignup} style={buttonStyle}>Send OTP</button>
          <p style={{ marginTop: '15px' }}>Already have an account? <Link to="/login" style={{ color: colors.primary }}>Login</Link></p>
        </>
      ) : (
        <>
          <h2 style={{ marginBottom: '20px', color: colors.primary }}>Enter OTP sent to your email</h2>
          {error && <p style={errorTextStyle}>{error}</p>}
          <input placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} style={inputStyle} />
          <button onClick={verifyOtp} style={buttonStyle}>Verify OTP</button>
        </>
      )}
    </div>
  );
};

export default Signup;
