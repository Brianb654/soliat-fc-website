import React, { useEffect, useState } from 'react';
import SeasonForm from './SeasonForm';

const API_URL = 'https://soliat-fc-website.onrender.com/api/seasons';

function SeasonList({ onSelectSeason }) {
  const [seasons, setSeasons] = useState([]);
  const [editingSeason, setEditingSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch seasons');
      const data = await res.json();
      setSeasons(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this season?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete season');
      setSeasons(seasons.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormSuccess = (season) => {
    if (editingSeason) {
      // update existing season in list
      setSeasons(seasons.map((s) => (s._id === season._id ? season : s)));
      setEditingSeason(null);
    } else {
      // add new season
      setSeasons([...seasons, season]);
    }
  };

  return (
    <div className="season-list-container">
      {/* Season Form */}
      <SeasonForm onSuccess={handleFormSuccess} existingSeason={editingSeason} />

      <h2>Seasons</h2>
      {loading && <p>Loading seasons...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {seasons.map((season) => (
          <li key={season._id}>
            <strong>{season.name}</strong> | {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
            <button onClick={() => setEditingSeason(season)}>Edit</button>
            <button onClick={() => handleDelete(season._id)}>Delete</button>
            {/* Select button to choose season and show its weeks */}
            {onSelectSeason && (
              <button onClick={() => onSelectSeason(season)}>Select</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeasonList;
