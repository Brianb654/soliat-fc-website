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

const MatchForm = () => {
  const [formData, setFormData] = useState({
    teamA: '',
    teamB: '',
    goalsA: '',
    goalsB: '',
  });
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/teams`);
        const sorted = res.data.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );
        setTeams(sorted);
      } catch (err) {
        console.error('❌ Failed to load teams:', err);
        setError('❌ Could not load teams.');
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('❌ You must be logged in.');
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/matches`,
        {
          teamA: formData.teamA,
          teamB: formData.teamB,
          goalsA: Number(formData.goalsA),
          goalsB: Number(formData.goalsB),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('✅ Match submitted successfully!');
      setFormData({ teamA: '', teamB: '', goalsA: '', goalsB: '' });
    } catch (err) {
      console.error('❌ Submission Error:', err);
      setError(
        err.response?.data?.message ||
        '❌ Failed to submit match. Check team names and try again.'
      );
    }
  };

  return (
    <div className="match-form-container">
      <h2 className="form-title">Submit Match Result</h2>
      {message && <div className="form-success">{message}</div>}
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="match-form">
        <div className="dropdown-group">
          <select name="teamA" value={formData.teamA} onChange={handleChange} required>
            <option value="">Select Team A</option>
            {teams.map((team) => (
              <option key={team._id} value={team.name}>
                {team.name}
              </option>
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
        />

        <div className="dropdown-group">
          <select name="teamB" value={formData.teamB} onChange={handleChange} required>
            <option value="">Select Team B</option>
            {teams.map((team) => (
              <option key={team._id} value={team.name}>
                {team.name}
              </option>
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
        />

        <button type="submit">Submit Result</button>
      </form>
    </div>
  );
};

export default MatchForm;
