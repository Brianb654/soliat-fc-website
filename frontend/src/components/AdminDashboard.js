import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css'; // Optional: add custom styling here

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard" style={{ padding: '2rem' }}>
      <h2>⚙️ Admin Panel</h2>
      <p>Welcome, Admin! You can now manage news, teams, league table, and players.</p>

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
        <li>
          <Link to="/admin/table">🏆 Update League Table</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
