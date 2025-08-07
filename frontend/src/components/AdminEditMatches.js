// src/components/AdminEditMatches.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminEditMatches = () => {
  const [matches, setMatches] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [updatedResult, setUpdatedResult] = useState('');
  const [userRole, setUserRole] = useState('');

  const API_URL = '/api/matches';

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) setUserRole(storedRole);
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(API_URL);
      setMatches(res.data);
    } catch (err) {
      console.error('❌ Error fetching matches:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchMatches();
    } catch (err) {
      console.error('❌ Error deleting match:', err);
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setUpdatedResult(match.result || '');
  };

  const handleUpdate = async () => {
    if (!updatedResult.trim()) return;
    try {
      await axios.put(`${API_URL}/${editingMatch._id}`, { result: updatedResult });
      setEditingMatch(null);
      setUpdatedResult('');
      fetchMatches();
    } catch (err) {
      console.error('❌ Error updating match:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🛠️ Edit & Manage Matches</h2>

      {matches.map((match) => (
        <div
          key={match._id}
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
          }}
        >
          <p>
            <strong>{match.homeTeam}</strong> vs <strong>{match.awayTeam}</strong> — Result:{' '}
            <strong>{match.result || '-'}</strong>
          </p>

          {editingMatch && editingMatch._id === match._id ? (
            <>
              <input
                type="text"
                value={updatedResult}
                onChange={(e) => setUpdatedResult(e.target.value)}
                placeholder="e.g., 2:1"
                style={{
                  padding: '6px',
                  fontSize: '1rem',
                  marginRight: '10px',
                }}
              />
              <button onClick={handleUpdate} style={buttonStyle}>
                ✅ Update
              </button>
              <button onClick={() => setEditingMatch(null)} style={cancelButtonStyle}>
                Cancel
              </button>
            </>
          ) : (
            <>
              {(userRole === 'admin' || userRole === 'editor') && (
                <button onClick={() => handleEdit(match)} style={buttonStyle}>
                  ✏️ Edit
                </button>
              )}
              {userRole === 'admin' && (
                <button onClick={() => handleDelete(match._id)} style={deleteButtonStyle}>
                  🗑️ Delete
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// ✅ Button Styles
const buttonStyle = {
  marginRight: '8px',
  padding: '5px 10px',
  backgroundColor: '#006400',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#800000',
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#aaa',
};

export default AdminEditMatches;
