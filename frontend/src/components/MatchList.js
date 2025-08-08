import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('role');

  // ✅ Fetch matches
  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMatches(sorted);
      })
      .catch(err => console.error('Error fetching matches:', err));
  }, []);

  // ✅ Group matches into weeks of 6
  const { groupedMatches, weekKeys } = useMemo(() => {
    const grouped = {};
    for (let i = 0; i < matches.length; i++) {
      const weekNumber = Math.floor(i / 6) + 1;
      const weekKey = `Week ${weekNumber}`;
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(matches[i]);
    }

    const keys = Object.keys(grouped);
    return { groupedMatches: grouped, weekKeys: keys };
  }, [matches]);

  // ✅ Automatically show latest week with matches
  useEffect(() => {
    if (!expandedWeek && weekKeys.length > 0) {
      setExpandedWeek(weekKeys[weekKeys.length - 1]);
    }
  }, [weekKeys, expandedWeek]);

  // ✅ Handle week change
  const handleWeekChange = (e) => {
    setExpandedWeek(e.target.value);
  };

  // ✅ Handle edits
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
      const sorted = updated.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMatches(sorted);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update match:', err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      {weekKeys.length > 0 && (
        <select
          value={expandedWeek}
          onChange={handleWeekChange}
          style={{ marginBottom: '1rem', padding: '0.5rem', fontSize: '1rem' }}
        >
          {weekKeys.map((wk) => (
            <option key={wk} value={wk}>
              {wk}
            </option>
          ))}
        </select>
      )}

      {expandedWeek && groupedMatches[expandedWeek] && (
        <div>
          <h3>{expandedWeek} Fixtures</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {groupedMatches[expandedWeek].map((match) => (
              <div key={match._id} style={{
                border: '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                {editingId === match._id ? (
                  <>
                    <input name="teamA" value={editForm.teamA} onChange={handleChange} />
                    <input name="teamB" value={editForm.teamB} onChange={handleChange} />
                    <input name="goalsA" value={editForm.goalsA} onChange={handleChange} type="number" />
                    <input name="goalsB" value={editForm.goalsB} onChange={handleChange} type="number" />
                    <input name="date" value={editForm.date} onChange={handleChange} type="date" />
                    <button onClick={handleSave} style={{ marginTop: '0.5rem' }}>Save</button>
                  </>
                ) : (
                  <>
                    <h4>{match.teamA} vs {match.teamB}</h4>
                    <p><strong>Score:</strong> {match.goalsA} - {match.goalsB}</p>
                    <p><strong>Date:</strong> {new Date(match.date).toLocaleDateString()}</p>
                    {(role === 'admin' || role === 'editor') && (
                      <button onClick={() => handleEditClick(match)}>Edit</button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchList;
