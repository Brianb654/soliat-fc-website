// src/components/AdminSeasonWeeks.js
import React from 'react';
import SeasonWeek from './SeasonWeekList';
import SeasonWeekForm from './SeasonWeekForm';

const AdminSeasonWeeks = () => {
  return (
    <div className="admin-season-weeks-container">
      <h2>Season Weeks</h2>
      <SeasonWeekForm />
      <SeasonWeek />
    </div>
  );
};

export default AdminSeasonWeeks;
