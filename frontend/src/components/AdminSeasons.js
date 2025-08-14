import React, { useState } from 'react';
import SeasonList from './SeasonList';
import SeasonWeekList from './SeasonWeekList';
import SeasonForm from './SeasonForm';
import SeasonWeekForm from './SeasonWeekForm';

const AdminSeasons = () => {
  const [selectedSeason, setSelectedSeason] = useState(null);

  return (
    <div className="admin-seasons-container">
      <h2>Manage Seasons & Weeks</h2>

      <div className="season-form-section">
        <h3>Add / Edit Season</h3>
        <SeasonForm />
      </div>

      <div className="season-list-section">
        <h3>Existing Seasons</h3>
        <SeasonList onSelectSeason={setSelectedSeason} />
      </div>

      {selectedSeason && (
        <div className="season-weeks-section">
          <h3>Weeks for: {selectedSeason.name}</h3>
          <SeasonWeekForm seasonId={selectedSeason._id} /> {/* form for new/edit week */}
          <SeasonWeekList seasonId={selectedSeason._id} />  {/* list filtered by season */}
        </div>
      )}
    </div>
  );
};

export default AdminSeasons;
