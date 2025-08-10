import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'https://soliat-fc-website.onrender.com/api/matches';

// Helper: Get last Sunday on or before refDate
const getLastSunday = (refDate = new Date()) => {
  const date = new Date(refDate);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0=Sun ... 6=Sat
  const daysSinceSunday = day === 0 ? 0 : day;
  date.setDate(date.getDate() - daysSinceSunday);
  return date;
};

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        // Adjust match dates: if weekday (Mon-Fri), change to last Sunday
        const adjusted = res.data.map(match => {
          const dateObj = new Date(match.date);
          if (isNaN(dateObj)) return match;

          const day = dateObj.getDay();
          if (day >= 1 && day <= 5) {
            const lastSunday = getLastSunday(dateObj);
            return { ...match, date: lastSunday.toISOString() };
          }
          return match;
        });

        // Sort by date ascending
        const sorted = adjusted.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMatches(sorted);
      })
      .catch(err => console.error('Error fetching matches:', err));
  }, []);

  // Group matches by relative week number starting from earliest match week Monday baseline
  const { groupedMatches, weekKeys } = useMemo(() => {
    if (matches.length === 0) return { groupedMatches: {}, weekKeys: [] };

    const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

    const firstDate = new Date(sortedMatches[0].date);
    const startOfWeekFirst = new Date(firstDate);
    startOfWeekFirst.setHours(0, 0, 0, 0);
    const day = startOfWeekFirst.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day; // Sunday(0) goes back 6 days, else adjust to Monday
    startOfWeekFirst.setDate(startOfWeekFirst.getDate() + diffToMonday);

    const grouped = {};

    for (const match of sortedMatches) {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);

      const diffMs = matchDate - startOfWeekFirst;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const relativeWeekNumber = Math.floor(diffDays / 7) + 1;

      const weekKey = `Week ${relativeWeekNumber}`;

      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(match);
    }

    for (const key in grouped) {
      grouped[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const sortedWeekKeys = Object.keys(grouped).sort((a, b) => {
      const numA = Number(a.replace('Week ', ''));
      const numB = Number(b.replace('Week ', ''));
      return numA - numB;
    });

    return { groupedMatches: grouped, weekKeys: sortedWeekKeys };
  }, [matches]);

  useEffect(() => {
    if (!expandedWeek && weekKeys.length > 0) {
      setExpandedWeek(weekKeys[weekKeys.length - 1]);
    }
  }, [weekKeys, expandedWeek]);

  const handleWeekChange = (e) => setExpandedWeek(e.target.value);

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
