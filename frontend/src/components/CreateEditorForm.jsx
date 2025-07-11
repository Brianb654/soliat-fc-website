import React, { useState } from 'react';
import axios from 'axios';
import './CreateEditorForm.css';

const CreateEditorForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('authToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/create-editor`,
        { email, password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to create editor');
    }
  };

  return (
    <div className="editor-container">
      <form onSubmit={handleSubmit} className="editor-form">
        <h3>Create Editor</h3>
        {message && <p className="editor-message">{message}</p>}
        <input
          type="email"
          placeholder="Editor Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="editor-input"
          required
        />
        <input
          type="password"
          placeholder="Editor Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="editor-input"
          required
        />
        <button type="submit" className="editor-button">Create</button>
      </form>
    </div>
  );
};

export default CreateEditorForm;
