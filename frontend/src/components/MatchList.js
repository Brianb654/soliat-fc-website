import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('role');

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setMatches(res.data))
      .catch(err => console.error('Error fetching matches:', err));
  }, []);

  const handleEditClick = (match) => {
    setEditingId(match._id);
    setEditForm({
      teamA: match.teamA,
      teamB: match.teamB,
      goalsA: match.goalsA,
      goalsB: match.goalsB,
      date: match.date.slice(0, 10),
    });
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.patch(`${API_URL}/${editingId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = matches.map((m) => (m._id === editingId ? res.data : m));
      setMatches(updated);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update match:', err.response?.data || err.message);
    }
  };

  return (
    <div>
      {matches.map((match) => (
        <div key={match._id} style={{ borderBottom: '1px solid #ccc', marginBottom: '1rem', paddingBottom: '1rem' }}>
          {editingId === match._id ? (
            <>
              <input
                name="teamA"
                value={editForm.teamA}
                onChange={handleChange}
                placeholder="Team A"
              />
              <input
                name="teamB"
                value={editForm.teamB}
                onChange={handleChange}
                placeholder="Team B"
              />
              <input
                name="goalsA"
                value={editForm.goalsA}
                onChange={handleChange}
                placeholder="Goals A"
                type="number"
              />
              <input
                name="goalsB"
                value={editForm.goalsB}
                onChange={handleChange}
                placeholder="Goals B"
                type="number"
              />
              <input
                name="date"
                value={editForm.date}
                onChange={handleChange}
                type="date"
              />
              <button onClick={handleSave}>✅ Save</button>
            </>
          ) : (
            <>
              <p><strong>{match.teamA}</strong> vs <strong>{match.teamB}</strong></p>
              <p>Score: {match.goalsA} - {match.goalsB}</p>
              <p>Date: {new Date(match.date).toLocaleDateString()}</p>
              {(role === 'admin' || role === 'editor') && (
                <button onClick={() => handleEditClick(match)}>✏️ Edit</button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MatchList;
