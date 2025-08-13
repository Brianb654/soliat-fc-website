import React, { useEffect, useState } from 'react';
import SeasonWeekForm from './SeasonWeekForm';

const API_URL = 'https://soliat-fc-website.onrender.com/api/seasonweeks';

function SeasonWeekList({ seasonId }) {
  const [weeks, setWeeks] = useState([]);
  const [editingWeek, setEditingWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeeks = async () => {
    setLoading(true);
    try {
      const url = seasonId ? `${API_URL}?seasonId=${seasonId}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch season weeks');
      const data = await res.json();
      setWeeks(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeeks();
  }, [seasonId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this week?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete week');
      setWeeks(weeks.filter((w) => w._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormSuccess = (week) => {
    if (editingWeek) {
      setWeeks(weeks.map(w => (w._id === week._id ? week : w)));
      setEditingWeek(null);
    } else {
      setWeeks([...weeks, week]);
    }
  };

  return (
    <div className="season-week-list-container">
      <SeasonWeekForm onSuccess={handleFormSuccess} existingWeek={editingWeek} seasonId={seasonId} />

      <h2>Season Weeks</h2>
      {loading && <p>Loading weeks...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {weeks.map((week) => (
          <li key={week._id}>
            Week {week.weekNumber} | {week.startDate && new Date(week.startDate).toLocaleDateString()} - {week.endDate && new Date(week.endDate).toLocaleDateString()}
            <button onClick={() => setEditingWeek(week)}>Edit</button>
            <button onClick={() => handleDelete(week._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeasonWeekList;


