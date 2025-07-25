import React from 'react';
import { Link } from 'react-router-dom';

const EditorDashboard = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'));

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧑‍💼 Editor Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <p>Role: {user?.role}</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>🛠️ Tools</h3>
        <ul>
          <li><Link to="/admin/post-news">➕ Post News</Link></li>
          <li><Link to="/admin/table">📊 Update League Table</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default EditorDashboard;
