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

// Map team names to logos
const logoMap = {
  'Ainabkoi FC': AinabkoiLogo,
  'Arangai FC': ArangaiLogo,
  'Drys FC': DrysLogo,
  'Kapsengwet FC': KapsengwetLogo,
  'Kewamoi FC': KewamoiLogo,
  'Kimuruk FC': KimurukLogo,
  'Kipteimet FC': KipteimetLogo,
  'Ndanai FC': NdanaiLogo,
  'Ngarua FC': NgaruaLogo,
  'Saito FC': SaitoLogo,
  'Soliat FC': SoliatLogo,
  'Zebra FC': ZebraLogo,
};

const API_URL = 'https://soliat-fc-website.onrender.com/api/teams';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        const sortedTeams = res.data.map(team => {
          const wins = team.wins || 0;
          const draws = team.draws || 0;
          const losses = team.losses || 0;
          const matchesPlayed = wins + draws + losses;
          const goalsFor = team.goalsFor || 0;
          const goalsAgainst = team.goalsAgainst || 0;
          const goalDifference = goalsFor - goalsAgainst;
          const points = team.points ?? (wins * 3 + draws);

          return {
            ...team,
            wins,
            draws,
            losses,
            matchesPlayed,
            goalsFor,
            goalsAgainst,
            goalDifference,
            points,
          };
        }).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.goalDifference - a.goalDifference;
        });

        setTeams(sortedTeams);
      })
      .catch(err => {
        console.error('❌ Error fetching teams:', err);
        setError('Failed to load teams');
      });
  }, []);

  return (
    <div className="league-container">
      <h2>🏆 Ainabkoi Sports Association League Table</h2>

      {error && <div className="error">{error}</div>}

      <div className="table-wrapper">
        <table className="league-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => {
              const teamName = team.name?.trim();
              return (
                <tr key={team._id || index}>
                  <td className="nowrap">{index + 1}</td>
                  <td className="team-cell">
                    <img
                      src={logoMap[teamName] || 'https://via.placeholder.com/30'}
                      alt={`${teamName} logo`}
                      className="team-logo"
                    />
                    <span className="team-name">{teamName}</span>
                  </td>
                  <td className="nowrap">{team.matchesPlayed}</td>
                  <td className="nowrap">{team.wins}</td>
                  <td className="nowrap">{team.draws}</td>
                  <td className="nowrap">{team.losses}</td>
                  <td className="nowrap">{team.goalsFor}</td>
                  <td className="nowrap">{team.goalsAgainst}</td>
                  <td className="nowrap">{team.goalDifference}</td>
                  <td className="nowrap">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamList;
