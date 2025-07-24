import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MatchForm from './MatchForm'; // ✅ import the MatchForm
import './AdminDashboard.css';

const API_URL = 'https://soliat-fc-website.onrender.com/api/admin/create-editor';

const AdminDashboard = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const handleCreateEditor = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('❌ You must be logged in.');
      return;
    }

    if (!name || !email || !password) {
      setMessage('❌ All fields are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        API_URL,
        { name, email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(`✅ Editor "${res.data.user.name}" created successfully!`);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('❌ Editor creation error:', err);
      setMessage(
        err.response?.data?.message || '❌ Failed to create editor.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard" style={{ padding: '2rem' }}>
      <h2>⚙️ Admin Panel</h2>
      <p>Welcome, Admin! You can now manage news, teams, players, league table — and add editors.</p>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
        <li style={{ marginBottom: '10px' }}>
          <Link to="/admin/news">📰 Manage News</Link>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <Link to="/admin/teams">📋 Manage Teams</Link>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <Link to="/admin/players">👥 Manage Players</Link>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <Link to="/admin/table">🏆 Update League Table</Link>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <Link to="/admin/users">👥 View All Users</Link>
        </li>
      </ul>

      {/* 👇 Only visible to admin or editor */}
      {(userRole === 'admin' || userRole === 'editor') && (
        <div style={{ marginTop: '3rem' }}>
          <h3>📝 Submit Match Result (Update League Table)</h3>
          <MatchForm />
        </div>
      )}

      {userRole === 'admin' && (
        <>
          <hr style={{ margin: '2rem 0' }} />
          <h3>➕ Add Editor</h3>
          {message && (
            <p
              style={{
                color: message.startsWith('✅') ? 'green' : 'red',
                fontWeight: 'bold',
              }}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleCreateEditor} style={{ maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Editor Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Editor Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Creating...' : 'Create Editor'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  marginBottom: '0.8rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
};

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  backgroundColor: '#800000',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '0.8rem',
};

export default AdminDashboard;
