import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import './MatchForm.css';

import AinabkoiLogo from '../assets/Ainabkoi.jpg';
import ArangaiLogo from '../assets/Arangai.jpg';
import DrysLogo from '../assets/Drys.jpg';
import KapsengwetLogo from '../assets/Kapsengwet.jpg';
import KewamoiLogo from '../assets/Kewamoi.jpg';
import KimurukLogo from '../assets/Kimuruk.jpg';
import KipteimetLogo from '../assets/Kipteimet.jpg';
import NdanaiLogo from '../assets/Ndanai.jpg';
import NgaruaLogo from '../assets/Ngarua.jpg';
import SaitoLogo from '../assets/Saito.jpg';
import SoliatLogo from '../assets/Soliat.jpg';
import ZebraLogo from '../assets/Zebra.jpg';

const logoMap = {
  "Ainabkoi FC": AinabkoiLogo,
  "Arangai FC": ArangaiLogo,
  "Drys FC": DrysLogo,
  "Kapsengwet FC": KapsengwetLogo,
  "Kewamoi FC": KewamoiLogo,
  "Kimuruk FC": KimurukLogo,
  "Kipteimet FC": KipteimetLogo,
  "Ndanai FC": NdanaiLogo,
  "Ngarua FC": NgaruaLogo,
  "Saito FC": SaitoLogo,
  "Soliat FC": SoliatLogo,
  "Zebra FC": ZebraLogo,
};

const BASE_URL = 'https://soliat-fc-website.onrender.com';

function getMatchKey(teamA, teamB, date) {
  const sorted = [teamA.toLowerCase(), teamB.toLowerCase()].sort();
  return `${sorted.join('_')}_${date}`;
}

const MatchForm = () => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkMatches, setBulkMatches] = useState([]);
  const [formData, setFormData] = useState({
    teamA: '',
    teamB: '',
    goalsA: '',
    goalsB: '',
    dayPlayed: '', // used only in single mode for input
  });

  // NEW: single bulk date for all bulk matches (default today)
  const [bulkDate, setBulkDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/teams`);
        const sorted = res.data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setTeams(sorted);
      } catch (err) {
        console.error('❌ Failed to load teams:', err);
        setError('❌ Could not load teams.');
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/matches`);
        setMatches(res.data);
      } catch (err) {
        console.error('❌ Failed to load matches:', err);
      }
    };
    fetchMatches();
  }, []);

  const doesMatchExist = (teamA, teamB, date, matchesArray) => {
    const key = getMatchKey(teamA, teamB, date);
    return matchesArray.some(m => getMatchKey(m.teamA, m.teamB, m.date) === key);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Bulk date change handler: updates bulkDate AND updates all bulkMatches dates to match
  const handleBulkDateChange = (e) => {
    const newDate = e.target.value;
    setBulkDate(newDate);
    setBulkMatches(prev => prev.map(m => ({ ...m, date: newDate })));
  };

  const handleAddToBulk = () => {
    const { teamA, teamB, goalsA, goalsB } = formData; // no dayPlayed here, use bulkDate
    const matchDate = bulkDate;

    if (!teamA || !teamB || goalsA === '' || goalsB === '') {
      return setError('❌ Please fill all fields.');
    }
    if (teamA === teamB) {
      return setError('❌ A team cannot play against itself.');
    }
    if (doesMatchExist(teamA, teamB, matchDate, [...matches, ...bulkMatches])) {
      return setError('❌ This match already exists or is in the bulk list.');
    }

    setBulkMatches([
      ...bulkMatches,
      {
        teamA,
        teamB,
        goalsA: Number(goalsA),
        goalsB: Number(goalsB),
        date: matchDate,
      },
    ]);

    setFormData({ teamA: '', teamB: '', goalsA: '', goalsB: '', dayPlayed: '' });
    setError('');
  };

  // Remove bulk match by index
  const handleRemoveBulkMatch = (indexToRemove) => {
    setBulkMatches(bulkMatches.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitBulk = async () => {
    if (bulkMatches.length === 0) {
      return setError('❌ No matches to submit.');
    }

    const token = localStorage.getItem('token');
    if (!token) return setError('❌ You must be logged in.');

    // Remove duplicates before submission
    const seen = new Set();
    const uniqueBulk = bulkMatches.filter((match) => {
      const key = getMatchKey(match.teamA, match.teamB, match.date);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    try {
      await axios.post(`${BASE_URL}/api/matches/bulk`, uniqueBulk, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`✅ Submitted ${uniqueBulk.length} matches successfully.`);
      setBulkMatches([]);
      const res = await axios.get(`${BASE_URL}/api/matches`);
      setMatches(res.data);
    } catch (err) {
      console.error('❌ Bulk submission failed:', err.response?.data || err);
      setError(err.response?.data?.message || '❌ Failed to submit bulk matches.');
    }
  };

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { teamA, teamB, goalsA, goalsB, dayPlayed } = formData;
    const matchDate = dayPlayed || new Date().toISOString().split('T')[0];

    if (!teamA || !teamB || goalsA === '' || goalsB === '') {
      return setError('❌ Please fill all fields.');
    }
    if (teamA === teamB) {
      return setError('❌ A team cannot play against itself.');
    }
    if (doesMatchExist(teamA, teamB, matchDate, matches)) {
      return setError('❌ A match between these teams already exists.');
    }

    const token = localStorage.getItem('token');
    if (!token) return setError('❌ You must be logged in.');

    try {
      const payload = {
        teamA,
        teamB,
        goalsA: Number(goalsA),
        goalsB: Number(goalsB),
        date: matchDate,
      };

      await axios.post(`${BASE_URL}/api/matches`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('✅ Match submitted successfully!');
      setFormData({ teamA: '', teamB: '', goalsA: '', goalsB: '', dayPlayed: '' });

      const res = await axios.get(`${BASE_URL}/api/matches`);
      setMatches(res.data);
    } catch (err) {
      console.error('❌ Submission Error:', err);
      setError(err.response?.data?.message || '❌ Failed to submit match.');
    }
  };

  return (
    <div className="page-container">
      {bulkMode && (
        <div className="card">
          <h3>📝 Bulk Preview</h3>

          {/* Single shared date input for all bulk matches */}
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="bulkDate">Date for all matches:</label>
            <input 
              id="bulkDate"
              type="date" 
              value={bulkDate} 
              onChange={handleBulkDateChange}
              required
            />
          </div>

          {bulkMatches.length > 0 ? (
            bulkMatches.map((m, idx) => (
              <div key={idx} className="bulk-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{m.teamA} {m.goalsA} - {m.goalsB} {m.teamB}</span>
                <button
                  className="remove-bulk-btn"
                  onClick={() => handleRemoveBulkMatch(idx)}
                  title="Remove match"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p>No matches added yet.</p>
          )}
          {bulkMatches.length > 0 && (
            <button className="submit-all" onClick={handleSubmitBulk}>
              ✅ Submit All
            </button>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="form-title">🏆 Update League Table</h2>
        <button
          className="mode-toggle"
          onClick={() => {
            setBulkMode(!bulkMode);
            setMessage('');
            setError('');
            setBulkMatches([]);
            setBulkDate(new Date().toISOString().split('T')[0]);
          }}
        >
          {bulkMode ? 'Switch to Single Match Mode' : 'Switch to Bulk Entry Mode'}
        </button>

        {message && <div className="form-success">{message}</div>}
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={bulkMode ? (e) => e.preventDefault() : handleSubmitSingle} className="match-form compact">
          <div className="form-grid">
            <div className="dropdown-group">
              <select name="teamA" value={formData.teamA} onChange={handleChange} required>
                <option value="">Select Team A</option>
                {teams.map((team) => (
                  <option key={team._id} value={team.name}>{team.name}</option>
                ))}
              </select>
              {formData.teamA && logoMap[formData.teamA] && (
                <img src={logoMap[formData.teamA]} alt={formData.teamA} className="team-logo" />
              )}
            </div>

            <input
              type="number"
              name="goalsA"
              placeholder="Goals A"
              value={formData.goalsA}
              onChange={handleChange}
              required
              min="0"
              step="1"
            />

            <div className="dropdown-group">
              <select name="teamB" value={formData.teamB} onChange={handleChange} required>
                <option value="">Select Team B</option>
                {teams.map((team) => (
                  <option key={team._id} value={team.name}>{team.name}</option>
                ))}
              </select>
              {formData.teamB && logoMap[formData.teamB] && (
                <img src={logoMap[formData.teamB]} alt={formData.teamB} className="team-logo" />
              )}
            </div>

            <input
              type="number"
              name="goalsB"
              placeholder="Goals B"
              value={formData.goalsB}
              onChange={handleChange}
              required
              min="0"
              step="1"
            />

            {/* Only show dayPlayed input in single mode */}
            {!bulkMode && (
              <input
                type="date"
                name="dayPlayed"
                value={formData.dayPlayed}
                onChange={handleChange}
                required
              />
            )}
          </div>

          {!bulkMode ? (
            <button type="submit" className="submit-btn">Submit Result</button>
          ) : (
            <button type="button" className="add-btn" onClick={handleAddToBulk}>➕ Add to List</button>
          )}
        </form>
      </div>
    </div>
  );
};

export default MatchForm;
