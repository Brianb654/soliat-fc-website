import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = 'https://soliat-fc-website.onrender.com/api/admin/users';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return setMessage('❌ You must be logged in.');

    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setMessage('❌ Failed to load users.');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="admin-dashboard" style={{ padding: '2rem' }}>
      <h2>👥 All Users</h2>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
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

export default AdminUsers;
