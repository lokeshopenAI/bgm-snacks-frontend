import React, { useState, useContext } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

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

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ phone:'', password:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const submitLogin = async () => {
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '20px', color: colors.primary }}>Login</h2>
      {error && <p style={errorTextStyle}>{error}</p>}
      <input placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
      <input type="password" placeholder="Password" name="password" value={form.password} onChange={handleChange} style={inputStyle} />
      <button onClick={submitLogin} style={buttonStyle}>Login</button>
      <p style={{ marginTop: '15px' }}>New user? <Link to="/signup" style={{ color: colors.primary }}>Signup</Link></p>
    </div>
  );
};

export default Login;
