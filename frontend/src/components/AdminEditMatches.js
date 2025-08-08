// src/pages/AdminEditMatches.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminEditMatches = () => {
  const [groupedMatches, setGroupedMatches] = useState({});
  const [weekKeys, setWeekKeys] = useState([]);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editData, setEditData] = useState({
    teamA: '',
    teamB: '',
    goalsA: '',
    goalsB: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

  const fetchMatches = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      const adjusted = distributeMatches(sorted);
      setGroupedMatches(adjusted.grouped);
      setWeekKeys(adjusted.keys);
    } catch (err) {
      toast.error('Failed to fetch matches');
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const getWeekendDate = (baseDateStr) => {
    const date = new Date(baseDateStr);
    const day = date.getDay();
    // If already Sat (6) or Sun (0), keep it. Else set to nearest Saturday
    if (day === 6 || day === 0) {
      return date.toISOString().slice(0, 10);
    } else {
      // Move to previous Saturday
      const diff = day;
      date.setDate(date.getDate() - diff + 6);
      return date.toISOString().slice(0, 10);
    }
  };

  const distributeMatches = (matchList) => {
    const grouped = {};
    matchList.forEach(match => {
      let weekDate = getWeekendDate(match.date);

      while (true) {
        if (!grouped[weekDate]) grouped[weekDate] = [];

        const teamAPlayed = grouped[weekDate].some(m => m.teamA === match.teamA || m.teamB === match.teamA);
        const teamBPlayed = grouped[weekDate].some(m => m.teamA === match.teamB || m.teamB === match.teamB);

        if (!teamAPlayed && !teamBPlayed) {
          match.date = weekDate; // Ensure match uses weekend date
          grouped[weekDate].push(match);
          break;
        } else {
          const prev = new Date(weekDate);
          prev.setDate(prev.getDate() - 7);
          weekDate = prev.toISOString().slice(0, 10);
        }
      }
    });

    const keys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    return { grouped, keys };
  };

  const handleEdit = (match) => {
    setEditingMatchId(match._id);
    setEditData({
      teamA: match.teamA,
      teamB: match.teamB,
      goalsA: match.goalsA,
      goalsB: match.goalsB,
      date: match.date
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const updated = { ...editData, date: getWeekendDate(editData.date) };

      await axios.put(`${API_URL}/${editingMatchId}`, updated, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Match updated successfully');
      fetchMatches();
      setEditingMatchId(null);
    } catch (err) {
      toast.error('Failed to save match');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Match deleted successfully');
      fetchMatches();
    } catch (err) {
      toast.error('Failed to delete match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-match-manager" style={{ padding: '20px' }}>
      <ToastContainer />
      <h2>Manage Matches</h2>

      {loading && <p style={{ color: 'blue' }}>Processing...</p>}

      {weekKeys.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        weekKeys.map((week) => (
          <div key={week} style={{ marginBottom: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid #333' }}>Week of {week}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {groupedMatches[week].map((match) => (
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
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) =>
                          setEditData({ ...editData, date: e.target.value })
                        }
                        placeholder="Match Date"
                      />
                      <button
                        onClick={handleSave}
                        style={{ marginLeft: '10px' }}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMatchId(null)}
                        style={{ marginLeft: '10px' }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong>{match.date}:</strong> {match.teamA} {match.goalsA} - {match.goalsB} {match.teamB}
                      </span>
                      <div>
                        <button onClick={() => handleEdit(match)} disabled={loading}>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(match._id)}
                          style={{ marginLeft: '8px', color: 'red' }}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminEditMatches;
