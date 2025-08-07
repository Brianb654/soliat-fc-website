// src/pages/AdminEditMatches.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminEditMatches = () => {
  const [matches, setMatches] = useState([]);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editData, setEditData] = useState({
    teamA: '',
    teamB: '',
    goalsA: '',
    goalsB: ''
  });
  const [error, setError] = useState('');

  const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

  // Fetch matches
  const fetchMatches = async () => {
    try {
      const res = await axios.get(API_URL);
      setMatches(res.data);
    } catch (err) {
      setError('Failed to fetch matches');
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Handle edit click
  const handleEdit = (match) => {
    setEditingMatchId(match._id);
    setEditData({
      teamA: match.teamA,
      teamB: match.teamB,
      goalsA: match.goalsA,
      goalsB: match.goalsB
    });
  };

  // Save edited match
  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/${editingMatchId}`, editData, {
        withCredentials: true
      });
      setEditingMatchId(null);
      fetchMatches(); // refresh updated match
    } catch (err) {
      setError('Failed to save match');
    }
  };

  // Delete match
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
      });
      setMatches(matches.filter((match) => match._id !== id));
    } catch (err) {
      setError('Failed to delete match');
    }
  };

  return (
    <div className="admin-match-manager" style={{ padding: '20px' }}>
      <h2>Manage Matches</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {matches.map((match) => (
            <li
              key={match._id}
              style={{
                marginBottom: '15px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            >
              {editingMatchId === match._id ? (
                <div>
                  <input
                    type="text"
                    value={editData.teamA}
                    onChange={(e) =>
                      setEditData({ ...editData, teamA: e.target.value })
                    }
                    placeholder="Team A"
                  />
                  <input
                    type="number"
                    value={editData.goalsA}
                    onChange={(e) =>
                      setEditData({ ...editData, goalsA: Number(e.target.value) })
                    }
                    placeholder="Goals A"
                  />
                  <span> - </span>
                  <input
                    type="number"
                    value={editData.goalsB}
                    onChange={(e) =>
                      setEditData({ ...editData, goalsB: Number(e.target.value) })
                    }
                    placeholder="Goals B"
                  />
                  <input
                    type="text"
                    value={editData.teamB}
                    onChange={(e) =>
                      setEditData({ ...editData, teamB: e.target.value })
                    }
                    placeholder="Team B"
                  />
                  <button onClick={handleSave} style={{ marginLeft: '10px' }}>
                    Save
                  </button>
                  <button onClick={() => setEditingMatchId(null)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {match.teamA} {match.goalsA} - {match.goalsB} {match.teamB}
                  </span>
                  <div>
                    <button onClick={() => handleEdit(match)}>Edit</button>
                    <button
                      onClick={() => handleDelete(match._id)}
                      style={{ marginLeft: '8px', color: 'red' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminEditMatches;
