import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../App';

const SeasonWeekList = ({ seasonId }) => {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch weeks for the selected season using RESTful route
  const fetchWeeks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/season/${seasonId}/weeks`);
      setWeeks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch season weeks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seasonId) {
      fetchWeeks();
    }
  }, [seasonId]);

  const handleDelete = async (weekId) => {
    if (!window.confirm('Are you sure you want to delete this week?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/season-weeks/${weekId}`);
      setWeeks(weeks.filter((w) => w._id !== weekId));
    } catch (err) {
      alert('Failed to delete week');
    }
  };

  if (!seasonId) return <p>Please select a season to see its weeks.</p>;
  if (loading) return <p>Loading weeks...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="season-week-list-container">
      <ul>
        {weeks.map((week) => (
          <li key={week._id}>
            <strong>{week.name}</strong> | {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
            <button onClick={() => handleDelete(week._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeasonWeekList;
