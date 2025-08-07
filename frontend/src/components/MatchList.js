import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMatch, setEditMatch] = useState(null);
  const [formData, setFormData] = useState({ homeTeam: '', awayTeam: '', homeScore: '', awayScore: '' });

  const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(API_URL);
        setMatches(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      }
    };
    fetchMatches();
  }, []);

  // Delete match
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMatches(matches.filter(match => match._id !== id));
    } catch (err) {
      console.error('Failed to delete match:', err);
    }
  };

  // Open edit form
  const handleEditClick = (match) => {
    setEditMatch(match._id);
    setFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore
    });
  };

  // Submit edited match
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${editMatch}`, formData);
      setMatches(matches.map(m => m._id === editMatch ? { ...m, ...formData } : m));
      setEditMatch(null);
    } catch (err) {
      console.error('Failed to update match:', err);
    }
  };

  if (loading) return <p>Loading matches...</p>;

  return (
    <div>
      <h2>All Matches</h2>
      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul>
          {matches.map((match) => (
            <li key={match._id}>
              {editMatch === match._id ? (
                <form onSubmit={handleEditSubmit}>
                  <input
                    type="text"
                    value={formData.homeTeam}
                    onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  />
                  <input
                    type="text"
                    value={formData.awayTeam}
                    onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                  />
                  <input
                    type="number"
                    value={formData.homeScore}
                    onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                  />
                  <input
                    type="number"
                    value={formData.awayScore}
                    onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditMatch(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  {match.homeTeam} {match.homeScore} : {match.awayScore} {match.awayTeam}
                  <button onClick={() => handleEditClick(match)}>Edit</button>
                  <button onClick={() => handleDelete(match._id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MatchList;
