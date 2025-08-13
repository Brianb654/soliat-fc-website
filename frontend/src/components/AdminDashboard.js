// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MatchForm from './MatchForm';
import AdminEditMatches from './AdminEditMatches';
import SeasonList from './SeasonList';

import './AdminDashboard.css';
import './AdminEditMatch.css';

const API_URL = 'https://soliat-fc-website.onrender.com/api/admin/create-editor';

const AdminDashboard = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('matches'); // ✅ NEW: Tab state

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ Editor "${res.data.user.name}" created successfully!`);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('❌ Editor creation error:', err);
      setMessage(err.response?.data?.message || '❌ Failed to create editor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard" style={{ padding: '2rem' }}>
      <h2>⚙️ Admin Panel</h2>
      <p>Welcome, Admin! You can now manage news, teams, players, league table — and add editors.</p>

      {/* Sidebar links remain unchanged */}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
        <li><Link to="/admin/news">📰 Manage News</Link></li>
        <li><Link to="/admin/matches">⚽ Manage Matches</Link></li>
        <li><Link to="/admin/players">👥 Manage Players</Link></li>
        <li><Link to="/admin/table">🏆 Update League Table</Link></li>
        <li><Link to="/admin/users">👥 View All Users</Link></li>
        <li><Link to="/admin/seasons">📅 Manage Seasons</Link></li>
      </ul>

      {/* ✅ NEW: Tabs inside admin dashboard */}
      {(userRole === 'admin' || userRole === 'editor') && (
        <div style={{ marginTop: '3rem' }}>
          <div className="admin-tabs">
            <button
              className={activeTab === 'matches' ? 'active' : ''}
              onClick={() => setActiveTab('matches')}
            >
              ⚽ Matches
            </button>
            <button
              className={activeTab === 'seasons' ? 'active' : ''}
              onClick={() => setActiveTab('seasons')}
            >
              📅 Seasons
            </button>
          </div>

          {activeTab === 'matches' && (
            <>
              <h3>📝 Submit Match Result (Update League Table)</h3>
              <MatchForm />

              <hr style={{ margin: '3rem 0' }} />

              <h3>📋 View & Manage All Matches</h3>
              <AdminEditMatches />
            </>
          )}

          {activeTab === 'seasons' && (
            <>
              <h3>📅 Manage Seasons</h3>
              <SeasonList />
            </>
          )}
        </div>
      )}

      {/* Admin-only editor creation */}
      {userRole === 'admin' && (
        <>
          <hr style={{ margin: '2rem 0' }} />
          <h3>➕ Add Editor</h3>
          {message && (
            <p className={message.startsWith('✅') ? 'success-message' : 'error-message'}>
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
