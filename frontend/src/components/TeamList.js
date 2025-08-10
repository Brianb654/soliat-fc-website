import React, { useEffect, useState, useRef } from 'react';   
import axios from 'axios';
import html2canvas from 'html2canvas';
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

// Helper: Convert teams to CSV string
const convertLeagueTableToCSV = (teams) => {
  const headers = ['Pos', 'Team', 'MP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];
  const rows = teams.map((team, idx) => [
    idx + 1,
    team.name,
    team.matchesPlayed,
    team.wins,
    team.draws,
    team.losses,
    team.goalsFor,
    team.goalsAgainst,
    team.goalDifference,
    team.points,
  ]);

  return [headers, ...rows].map(e => e.join(',')).join('\n');
};

// Helper: Trigger CSV download
const downloadCSV = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const tableRef = useRef(null);

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

  // Download CSV only
  const handleDownloadCSV = () => {
    const csv = convertLeagueTableToCSV(teams);
    downloadCSV(csv, `league_table_${new Date().toISOString().slice(0,10)}.csv`);
  };

  // Download Image only
  const handleDownloadImage = () => {
    if (!tableRef.current) return;

    html2canvas(tableRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = `league_table_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div className="league-container">
      {/* Wrap title and table together inside the ref for image capture */}
      <div ref={tableRef}>
        <h2>🏆 Ainabkoi Sports Association League Table</h2>

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

          {/* White space spacer below table for better image spacing */}
          <div className="table-footer-spacer"></div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Separate buttons for CSV and Image download */}
      <div className="download-buttons">
        <button onClick={handleDownloadCSV} className="btn-download">
          Download CSV
        </button>
        <button onClick={handleDownloadImage} className="btn-download btn-download-image">
          Download Image
        </button>
      </div>
    </div>
  );
};

export default TeamList;
