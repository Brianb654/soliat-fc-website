import React, { useState } from 'react';

const API_URL = 'https://soliat-fc-website.onrender.com/api/seasons';

function SeasonForm({ onSuccess, existingSeason }) {
  const [name, setName] = useState(existingSeason?.name || '');
  const [startDate, setStartDate] = useState(existingSeason?.startDate?.slice(0, 10) || '');
  const [endDate, setEndDate] = useState(existingSeason?.endDate?.slice(0, 10) || '');
  const [error, setError] = useState('');

  const isEdit = !!existingSeason;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !startDate || !endDate) {
      setError('Please fill all fields');
      return;
    }

    const payload = { name, startDate, endDate };

    try {
      const res = await fetch(
        isEdit ? `${API_URL}/${existingSeason._id}` : API_URL,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save season');
      }

      const data = await res.json();
      onSuccess(data);

      if (!isEdit) {
        setName('');
        setStartDate('');
        setEndDate('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="season-form">
      <h2>{isEdit ? 'Edit Season' : 'Create Season'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>
        Season Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 2025 ASA League"
        />
      </label>

      <label>
        Start Date:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label>
        End Date:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>

      <button type="submit">{isEdit ? 'Update' : 'Create'}</button>
    </form>
  );
}

export default SeasonForm;
