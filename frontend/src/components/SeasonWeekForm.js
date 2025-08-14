// src/components/SeasonWeekForm.jsx
import React, { useState } from 'react';

const SeasonWeekForm = ({ onAddWeek }) => {
  const [weekName, setWeekName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weekName) return;
    onAddWeek(weekName);
    setWeekName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter week name"
        value={weekName}
        onChange={(e) => setWeekName(e.target.value)}
      />
      <button type="submit">Add Week</button>
    </form>
  );
};

export default SeasonWeekForm;
