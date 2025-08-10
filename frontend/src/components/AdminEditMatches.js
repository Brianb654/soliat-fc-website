import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

const AdminEditMatches = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    teamA: '',
    teamB: '',
    goalsA: 0,
    goalsB: 0,
    date: '',
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('authToken');

  // Helper: Get last Sunday on or before refDate
  const getLastSunday = (refDate = new Date()) => {
    const date = new Date(refDate);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay(); // 0=Sun ... 6=Sat
    const daysSinceSunday = day === 0 ? 0 : day;
    date.setDate(date.getDate() - daysSinceSunday);
    return date;
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Process matches: if date invalid or weekday (Mon-Fri), set to last Sunday
        const processed = res.data.map((match, index, arr) => {
          let dateObj = new Date(match.date);
          if (isNaN(dateObj)) {
            // fallback refDate: previous match date or today
            let refDate = index > 0 ? new Date(arr[index - 1].date) : new Date();
            if (isNaN(refDate)) refDate = new Date();
            const lastSunday = getLastSunday(refDate);
            return { ...match, date: lastSunday.toISOString() };
          }

          // If Mon-Fri, reset to last Sunday
          const day = dateObj.getDay();
          if (day >= 1 && day <= 5) {
            const lastSunday = getLastSunday(dateObj);
            return { ...match, date: lastSunday.toISOString() };
          }

          // Sat or Sun keep as is
          return match;
        });

        // Sort ascending by date
        const sorted = processed.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMatches(sorted);
      } catch (err) {
        toast.error('Failed to fetch matches');
      }
    };
    if (token) fetchMatches();
  }, [token]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get('https://soliat-fc-website.onrender.com/api/teams', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(res.data.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      } catch (err) {
        toast.error('Failed to fetch teams');
      }
    };
    if (token) fetchTeams();
  }, [token]);

  // Group matches by relative week number starting from earliest match week Monday baseline
  const { groupedMatches, weekKeys } = useMemo(() => {
    if (matches.length === 0) return { groupedMatches: {}, weekKeys: [] };

    const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get Monday of first match week as baseline
    const firstDate = new Date(sortedMatches[0].date);
    const startOfWeekFirst = new Date(firstDate);
    startOfWeekFirst.setHours(0, 0, 0, 0);
    const day = startOfWeekFirst.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day; // Sunday(0) goes back 6 days, else adjust to Monday
    startOfWeekFirst.setDate(startOfWeekFirst.getDate() + diffToMonday);

    const grouped = {};

    // Track teams per week to ensure 1 match per team per week
    const teamWeekTracker = {};

    for (const match of sortedMatches) {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);

      const diffMs = matchDate - startOfWeekFirst;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const relativeWeekNumber = Math.floor(diffDays / 7) + 1;
      const weekKey = `Week ${relativeWeekNumber}`;

      // Check if teams already have a match this week (skip or add anyway? here we add all but you can filter if needed)
      const teamKeyA = `${match.teamA}-${weekKey}`;
      const teamKeyB = `${match.teamB}-${weekKey}`;

      if (!teamWeekTracker[teamKeyA] && !teamWeekTracker[teamKeyB]) {
        if (!grouped[weekKey]) grouped[weekKey] = [];
        grouped[weekKey].push(match);
        teamWeekTracker[teamKeyA] = true;
        teamWeekTracker[teamKeyB] = true;
      } else {
        // Optionally: handle duplicate matches per team per week if you want
        if (!grouped[weekKey]) grouped[weekKey] = [];
        grouped[weekKey].push(match);
      }
    }

    // Sort matches inside each week by date ascending
    for (const key in grouped) {
      grouped[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const sortedWeekKeys = Object.keys(grouped).sort((a, b) => {
      const numA = Number(a.replace('Week ', ''));
      const numB = Number(b.replace('Week ', ''));
      return numA - numB;
    });

    return { groupedMatches: grouped, weekKeys: sortedWeekKeys };
  }, [matches]);

  useEffect(() => {
    if (!expandedWeek && weekKeys.length > 0) {
      setExpandedWeek(weekKeys[weekKeys.length - 1]);
    }
  }, [weekKeys, expandedWeek]);

  const handleWeekChange = (e) => setExpandedWeek(e.target.value);

  const handleEditClick = (match) => {
    const fallbackTeam = teams.length > 0 ? teams[0].name : '';
    setEditingId(match._id);
    setEditForm({
      teamA: match.teamA || fallbackTeam,
      teamB: match.teamB || fallbackTeam,
      goalsA: typeof match.goalsA === 'number' ? match.goalsA : 0,
      goalsB: typeof match.goalsB === 'number' ? match.goalsB : 0,
      date: match.date ? match.date.slice(0, 10) : '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name.startsWith('goals') ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (
      !editForm.teamA ||
      !editForm.teamB ||
      editForm.goalsA == null ||
      editForm.goalsB == null ||
      editForm.teamA === editForm.teamB
    ) {
      toast.error('Please fill all fields correctly and ensure teams are different');
      return;
    }

    try {
      setLoading(true);

      // If user didn't change date, or it's a weekday, replace with last Sunday
      let saveDate = editForm.date;
      if (saveDate) {
        const d = new Date(saveDate);
        const day = d.getDay();
        if (day >= 1 && day <= 5) {
          const lastSunday = getLastSunday(d);
          saveDate = lastSunday.toISOString().slice(0, 10);
        }
      } else {
        const lastSunday = getLastSunday(new Date());
        saveDate = lastSunday.toISOString().slice(0, 10);
      }

      const payload = { ...editForm, date: saveDate };

      const res = await axios.put(`${API_URL}/${editingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedMatch = res.data.match || res.data;
      const updated = matches.map((m) => (m._id === editingId ? updatedMatch : m));
      const sorted = updated.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMatches(sorted);
      setEditingId(null);
      toast.success('Match updated successfully');
    } catch (err) {
      toast.error('Failed to save match');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches((prev) => prev.filter((m) => m._id !== id));
      toast.success('Match deleted successfully');
    } catch (err) {
      toast.error('Failed to delete match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <ToastContainer />
      <h2>⚽ Manage Matches</h2>

      {weekKeys.length > 0 && (
        <select
          value={expandedWeek || ''}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            {groupedMatches[expandedWeek].map((match) => (
              <div
                key={match._id}
                style={{
                  border: '1px solid #ccc',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                {editingId === match._id ? (
                  <>
                    <select
                      name="teamA"
                      value={editForm.teamA || ''}
                      onChange={handleChange}
                      style={{ marginBottom: '0.3rem', width: '100%' }}
                    >
                      <option value="">Select Team A</option>
                      {teams.map((team) => (
                        <option key={team._id || team.name} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </select>

                    <select
                      name="teamB"
                      value={editForm.teamB || ''}
                      onChange={handleChange}
                      style={{ marginBottom: '0.3rem', width: '100%' }}
                    >
                      <option value="">Select Team B</option>
                      {teams.map((team) => (
                        <option key={team._id || team.name} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </select>

                    <input
                      name="goalsA"
                      value={editForm.goalsA}
                      onChange={handleChange}
                      type="number"
                      min={0}
                      style={{ marginBottom: '0.3rem', width: '100%' }}
                    />
                    <input
                      name="goalsB"
                      value={editForm.goalsB}
                      onChange={handleChange}
                      type="number"
                      min={0}
                      style={{ marginBottom: '0.3rem', width: '100%' }}
                    />
                    <input
                      name="date"
                      value={editForm.date || ''}
                      onChange={handleChange}
                      type="date"
                      style={{ marginBottom: '0.3rem', width: '100%' }}
                    />
                    <button onClick={handleSave} disabled={loading} style={{ marginTop: '0.5rem' }}>
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ marginLeft: '0.5rem', marginTop: '0.5rem' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h4>
                      {match.teamA} vs {match.teamB}
                    </h4>
                    <p>
                      <strong>Score:</strong> {match.goalsA} - {match.goalsB}
                    </p>
                    <p>
                      <strong>Date:</strong> {match.date ? new Date(match.date).toLocaleDateString() : 'N/A'}
                    </p>
                    <button onClick={() => handleEditClick(match)} disabled={loading}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(match._id)}
                      style={{ marginLeft: '0.5rem', color: 'red' }}
                      disabled={loading}
                    >
                      Delete
                    </button>
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

export default AdminEditMatches;
