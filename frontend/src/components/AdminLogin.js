import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();
    setError('');

    const loginUrl = `${process.env.REACT_APP_API_URL}/api/admin/login`;
    console.log('🔍 Login URL:', loginUrl);

    try {
      const res = await axios.post(loginUrl, { email, password });

      // ✅ Save token & user info
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data));

      // ✅ Call login callback (if any)
      if (onLogin) onLogin(res.data);

      // ✅ Redirect + Auto-refresh
      navigate('/admin/post-news');
      setTimeout(() => {
        window.location.reload(); // 🔁 Force reload to show admin-only UI
      }, 300); // slight delay for smooth redirect
    } catch (err) {
      console.error('❌ Login error:', err);
      const msg = err.response?.data?.message || 'Unexpected login error';
      setError('❌ ' + msg);
    }
  };

  return (
    <form onSubmit={loginHandler} style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>🔐 Admin Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default AdminLogin;
