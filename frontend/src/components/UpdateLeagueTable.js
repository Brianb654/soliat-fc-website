import React from 'react';
import MatchForm from './MatchForm';

const UpdateLeagueTable = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-maroon mb-4">🏆 Update League Table</h1>
      <p className="mb-4">Admins and editors can manually submit match results below. This updates the table automatically.</p>
      <MatchForm />
    </div>
  );
};

export default UpdateLeagueTable;
