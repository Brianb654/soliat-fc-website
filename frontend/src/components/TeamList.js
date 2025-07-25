import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TeamList.css';

// Import team logos
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

// Map team names to their logos
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
    axios
      .get('https://soliat-fc-website.onrender.com/api/teams')
      .then(res => {
        const sortedTeams = res.data.sort((a, b) => {
          const totalA = a.points + (a.goalsFor || 0) + (a.goalsAgainst || 0);
          const totalB = b.points + (b.goalsFor || 0) + (b.goalsAgainst || 0);

          if (totalA === 0 && totalB === 0) {
            return a.name.localeCompare(b.name);
          }

          if (b.points !== a.points) {
            return b.points - a.points;
          }

          return b.goalDifference - a.goalDifference;
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
            <th>MP</th>
            <th>Points</th>
            <th>Goal Difference</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team._id}>
              <td>{index + 1}</td>
              <td className="team-cell">
                <img
                  src={logoMap[team.name] || 'https://via.placeholder.com/30'}
                  alt={`${team.name} logo`}
                  className="team-logo"
                />
                <span>{team.name}</span>
              </td>
              <td>{team.matchesPlayed || 0}</td>
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
