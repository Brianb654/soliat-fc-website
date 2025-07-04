import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/teams')
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
                  src={team.logoUrl || 'https://via.placeholder.com/30'} 
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
