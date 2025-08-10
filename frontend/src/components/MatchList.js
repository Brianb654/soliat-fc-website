import React, { useEffect, useState, useMemo, useRef } from 'react'; 
import axios from 'axios';
import html2canvas from 'html2canvas';
import './MatchList.css'; // Your CSS file

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
  const fullTableRef = useRef(null);
  const weekTableRef = useRef(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
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

        const sorted = adjusted.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMatches(sorted);
      })
      .catch(err => console.error('Error fetching matches:', err));
  }, []);

  // Group matches by week
  const { groupedMatches, weekKeys } = useMemo(() => {
    if (matches.length === 0) return { groupedMatches: {}, weekKeys: [] };

    const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

    const firstDate = new Date(sortedMatches[0].date);
    const startOfWeekFirst = new Date(firstDate);
    startOfWeekFirst.setHours(0, 0, 0, 0);
    const day = startOfWeekFirst.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
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

  // -- DOWNLOAD FUNCTIONS (defined inside component) --

  // Converts matches array to CSV string
  const convertMatchesToCSV = (matches) => {
    const headers = ['Date', 'Team A', 'Goals A', 'Goals B', 'Team B'];
    const rows = matches.map(m => [
      new Date(m.date).toLocaleDateString(),
      m.teamA,
      m.goalsA,
      m.goalsB,
      m.teamB,
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\n');
  };

  // Trigger CSV download helper
  const downloadCSV = (csvString, filename) => {
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download all matches CSV
  const downloadFullMatchesCSV = () => {
    const csv = convertMatchesToCSV(matches);
    downloadCSV(csv, `all_matches_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Download all matches as image
  const downloadFullMatchesImage = () => {
    if (!fullTableRef.current) return;
    html2canvas(fullTableRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = `all_matches_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Download current week CSV
  const downloadWeekMatchesCSV = () => {
    if (!expandedWeek || !groupedMatches[expandedWeek]) return;
    const csv = convertMatchesToCSV(groupedMatches[expandedWeek]);
    downloadCSV(csv, `${expandedWeek}_matches_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Download current week image
  const downloadWeekMatchesImage = () => {
    if (!weekTableRef.current) return;
    html2canvas(weekTableRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = `${expandedWeek}_matches_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div className="matchlist-container">

      {/* Week select dropdown */}
      {weekKeys.length > 0 && (
        <select
          value={expandedWeek}
          onChange={handleWeekChange}
          className="matchlist-week-select"
        >
          {weekKeys.map((wk) => (
            <option key={wk} value={wk}>{wk}</option>
          ))}
        </select>
      )}

      {/* Full matches table (hidden for image capture) */}
      <div ref={fullTableRef} style={{ display: 'none' }}>
        <h2>All Matches Results</h2>
        {matches.map(match => (
          <div key={match._id} className="match-row">
            <span className="team-name">{match.teamA}</span>
            <span className="score">{match.goalsA} - {match.goalsB}</span>
            <span className="team-name" style={{ textAlign: 'right' }}>{match.teamB}</span>
            <span className="match-date">{new Date(match.date).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      {/* Current week matches */}
      {expandedWeek && groupedMatches[expandedWeek] && (
        <div className="week-card" ref={weekTableRef}>
          <h3 className="week-title">{expandedWeek} Results</h3>
          {groupedMatches[expandedWeek].map(match => (
            <div key={match._id} className="match-row">
              <span className="team-name">{match.teamA}</span>
              <span className="score">{match.goalsA} - {match.goalsB}</span>
              <span className="team-name" style={{ textAlign: 'right' }}>{match.teamB}</span>
              <span className="match-date">{new Date(match.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Download buttons */}
      <div className="download-buttons">
        <div>
          <button onClick={downloadFullMatchesCSV}>Download All Matches CSV</button>
          <button onClick={downloadFullMatchesImage}>Download All Matches Image</button>
        </div>
        <div>
          <button onClick={downloadWeekMatchesCSV} disabled={!expandedWeek}>
            Download {expandedWeek} CSV
          </button>
          <button onClick={downloadWeekMatchesImage} disabled={!expandedWeek}>
            Download {expandedWeek} Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchList;
