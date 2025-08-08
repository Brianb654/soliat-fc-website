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

function getMatchKey(teamA, teamB) {
  // Sort team names to make order irrelevant
  const sorted = [teamA.toLowerCase(), teamB.toLowerCase()].sort();
  return sorted.join('_');
}

const MatchForm = () => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]); // <-- store existing matches here
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkMatches, setBulkMatches] = useState([]);
  const [formData, setFormData] = useState({
    teamA: '',
    teamB: '',
    goalsA: '',
    goalsB: '',
    dayPlayed: '',
  });

  // Fetch teams
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

  // Fetch existing matches
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

  // Check if match pair exists in an array of matches (ignoring order)
  const doesMatchExist = (teamA, teamB, matchesArray) => {
    const newKey = getMatchKey(teamA, teamB);
    return matchesArray.some(m => getMatchKey(m.teamA, m.teamB) === newKey);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Bulk add with duplicate check (against existing matches + bulk list)
  const handleAddToBulk = () => {
    const { teamA, teamB, goalsA, goalsB, dayPlayed } = formData;

    if (!teamA || !teamB || goalsA === '' || goalsB === '') {
      return setError('❌ Please fill all fields.');
    }
    if (teamA === teamB) {
      return setError('❌ A team cannot play against itself.');
    }

    // Check if already in bulkMatches or existing matches
    if (doesMatchExist(teamA, teamB, [...matches, ...bulkMatches])) {
      return setError('❌ This match between these teams already exists or is in the bulk list.');
    }

    setBulkMatches([
      ...bulkMatches,
      {
        teamA,
        teamB,
        goalsA: Number(goalsA),
        goalsB: Number(goalsB),
        dayPlayed: dayPlayed || new Date().toISOString().split('T')[0],
      },
    ]);

    setFormData({
      teamA: '',
      teamB: '',
      goalsA: '',
      goalsB: '',
      dayPlayed: '',
    });
    setError('');
  };

  const handleSubmitBulk = async () => {
    const token = localStorage.getItem('token');
    if (!token) return setError('❌ You must be logged in.');

    try {
      await axios.post(`${BASE_URL}/api/matches/bulk`, { matches: bulkMatches }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`✅ Submitted ${bulkMatches.length} matches successfully.`);
      setBulkMatches([]);
      // Refresh matches after submit
      const res = await axios.get(`${BASE_URL}/api/matches`);
      setMatches(res.data);
    } catch (err) {
      console.error('❌ Bulk submission failed:', err);
      setError('❌ Failed to submit bulk matches.');
    }
  };

  // Single submit with duplicate check
  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { teamA, teamB, goalsA, goalsB, dayPlayed } = formData;

    if (!teamA || !teamB || goalsA === '' || goalsB === '') {
      return setError('❌ Please fill all fields.');
    }
    if (teamA === teamB) {
      return setError('❌ A team cannot play against itself.');
    }

    // Check for duplicate in existing matches
    if (doesMatchExist(teamA, teamB, matches)) {
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
        dayPlayed: dayPlayed || new Date().toISOString().split('T')[0],
      };

      await axios.post(`${BASE_URL}/api/matches`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('✅ Match submitted successfully!');
      setFormData({ teamA: '', teamB: '', goalsA: '', goalsB: '', dayPlayed: '' });

      // Refresh matches after submit
      const res = await axios.get(`${BASE_URL}/api/matches`);
      setMatches(res.data);
    } catch (err) {
      console.error('❌ Submission Error:', err);
      setError(err.response?.data?.message || '❌ Failed to submit match.');
    }
  };

  return (
    <div className="page-container">

      {/* Bulk List Card */}
      {bulkMode && (
        <div className="card">
          <h3>📝 Bulk Preview</h3>
          <div className="bulk-list">
            {bulkMatches.length > 0 ? (
              bulkMatches.map((m, idx) => (
                <div key={idx} className="bulk-item">
                  {m.teamA} {m.goalsA} - {m.goalsB} {m.teamB} ({m.dayPlayed})
                </div>
              ))
            ) : (
              <p>No matches added yet.</p>
            )}
          </div>
          {bulkMatches.length > 0 && (
            <button className="submit-all" onClick={handleSubmitBulk}>✅ Submit All</button>
          )}
        </div>
      )}

      {/* Form Card */}
      <div className="card">
        <h2 className="form-title">🏆 Update League Table</h2>
        <button className="mode-toggle" onClick={() => setBulkMode(!bulkMode)}>
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

            <input type="number" name="goalsA" placeholder="Goals A" value={formData.goalsA} onChange={handleChange} required />

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

            <input type="number" name="goalsB" placeholder="Goals B" value={formData.goalsB} onChange={handleChange} required />

            <input type="date" name="dayPlayed" value={formData.dayPlayed} onChange={handleChange} />
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
