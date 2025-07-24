import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_API_URL || 'https://soliat-fc-website.onrender.com';
  if (!process.env.REACT_APP_API_URL) {
    console.warn('⚠️ Using fallback BASE_URL. Set REACT_APP_API_URL in .env and Vercel for clean setup.');
  }

  const loginHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginUrl = `${BASE_URL}/api/admin/login`;
    console.log('🔍 Login URL:', loginUrl);

    try {
      const res = await axios.post(loginUrl, { email, password });

      localStorage.setItem('token', res.data.token); // ✅ fixed key
      localStorage.setItem('userInfo', JSON.stringify(res.data));

      if (onLogin) onLogin(res.data);

      navigate('/admin/post-news');
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (err) {
      console.error('❌ Login error:', err);
      const msg = err.response?.data?.message || 'Unexpected login error';
      setError('❌ ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={loginHandler} className="login-form">
        <h2>🔐 Admin Login</h2>
        {error && <p className="login-error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-wrapper">
              <span className="ring-loader"></span>
              Logging in...
            </span>
          ) : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
