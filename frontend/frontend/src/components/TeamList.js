import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Import team logos — match file names exactly as in src/assets/
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

// Map team names to logos
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

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('https://soliat-fc-backend-production.up.railway.app/api/teams')
   
    .then(res => {
        const sortedTeams = res.data.sort((a, b) => {
          return a.name.localeCompare(b.name);  // Sort alphabetically
        });
        setTeams(sortedTeams);
      })
      .catch(err => {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
      });
  }, []);

  return (
    <div className="league-container">
      <h2>🏆 Ainabkoi Sports Association League Table</h2>
      {error && <p className="error">{error}</p>}

      <table className="league-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>Points</th>
            <th>Goal Difference</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team._id}>
              <td>{index + 1}</td>
              <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={logoMap[team.name] || 'https://via.placeholder.com/30'}
                  alt={`${team.name} logo`}
                  style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                />
                {team.name}
              </td>
              <td>{team.points}</td>
              <td>{team.goalDifference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamList;

