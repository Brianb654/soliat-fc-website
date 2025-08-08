import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);

  // ✅ Fetch matches
  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMatches(sorted);
      })
      .catch(err => console.error('Error fetching matches:', err));
  }, []);

  // ✅ Group matches into weeks of 6
  const { groupedMatches, weekKeys } = useMemo(() => {
    const grouped = {};
    for (let i = 0; i < matches.length; i++) {
      const weekNumber = Math.floor(i / 6) + 1;
      const weekKey = `Week ${weekNumber}`;
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(matches[i]);
    }
    return { groupedMatches: grouped, weekKeys: Object.keys(grouped) };
  }, [matches]);

  // ✅ Auto-select latest week
  useEffect(() => {
    if (!expandedWeek && weekKeys.length > 0) {
      setExpandedWeek(weekKeys[weekKeys.length - 1]);
    }
  }, [weekKeys, expandedWeek]);

  // ✅ Week change handler
  const handleWeekChange = (e) => {
    setExpandedWeek(e.target.value);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: 'auto' }}>
      {weekKeys.length > 0 && (
        <select
          value={expandedWeek}
          onChange={handleWeekChange}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        >
          {weekKeys.map((wk) => (
            <option key={wk} value={wk}>{wk}</option>
          ))}
        </select>
      )}

      {expandedWeek && groupedMatches[expandedWeek] && (
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '1rem'
        }}>
          <h3 style={{
            borderBottom: '2px solid #007BFF',
            paddingBottom: '0.4rem',
            marginBottom: '1rem',
            color: '#007BFF'
          }}>
            {expandedWeek} Results
          </h3>

          {groupedMatches[expandedWeek].map((match) => (
            <div
              key={match._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto',
                alignItems: 'center',
                padding: '0.6rem 0.8rem',
                background: '#f9f9f9',
                borderRadius: '6px',
                border: '1px solid #eee',
                marginBottom: '0.5rem'
              }}
            >
              <span style={{ fontWeight: 500 }}>{match.teamA}</span>
              <span style={{ fontWeight: 'bold', textAlign: 'center' }}>
                {match.goalsA} - {match.goalsB}
              </span>
              <span style={{ fontWeight: 500, textAlign: 'right' }}>{match.teamB}</span>
              <span style={{ fontSize: '0.85rem', color: '#777', textAlign: 'right' }}>
                {new Date(match.date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;
