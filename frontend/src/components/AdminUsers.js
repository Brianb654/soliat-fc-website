import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Your provided styles assumed here

const API_BASE = 'https://soliat-fc-website.onrender.com/api/admin';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const token = localStorage.getItem('authToken');

  const fetchUsers = useCallback(async () => {
    if (!token) return setMessage('❌ You must be logged in.');
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to load users.');
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (message.startsWith('✅')) {
      const timer = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateEditor = async (e) => {
    e.preventDefault();
    if (!token) return setMessage('❌ You must be logged in.');
    setCreating(true);
    try {
      const res = await axios.post(`${API_BASE}/create-editor`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || '✅ Editor created!');
      setForm({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to create editor.');
    }
    setCreating(false);
  };

  return (
    <div className="admin-dashboard" style={dashboardStyle}>
      {/* Left Column - Users */}
      <div style={usersSectionStyle}>
        <h2 style={{ color: '#800000' }}>👥 All Users</h2>
        <p>Total: {users.length}</p>
        {message && (
          <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>
        )}
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={tdStyle}>{u.name || u.username}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.role}</td>
                  <td style={tdStyle}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Right Column - Form */}
      <div style={formSectionStyle}>
        <h2 style={{ color: '#800000' }}>➕ Add Editor</h2>
        <form onSubmit={handleCreateEditor} style={formStyle}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle} disabled={creating}>
            {creating ? 'Creating...' : 'Create Editor'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ✅ Layout styles
const dashboardStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  padding: '2rem',
  gap: '2rem',
  background: '#f8f8f8',
  minHeight: '100vh',
};

const usersSectionStyle = {
  flex: 1,
  minWidth: '300px',
  background: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
};

const formSectionStyle = {
  maxWidth: '400px',
  flex: 1,
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '16px',
  padding: '2rem',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
};

// ✅ Table styles
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle = {
  borderBottom: '2px solid #800000',
  textAlign: 'left',
  padding: '8px',
};

const tdStyle = {
  borderBottom: '1px solid #ccc',
  padding: '8px',
};

// ✅ Form & Input styles
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const inputStyle = {
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '8px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#800000',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default AdminUsers;
