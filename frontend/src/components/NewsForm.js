import React, { useState } from 'react';
import axios from 'axios';
import './News.css';

// ✅ Set backend URL explicitly
const API_BASE_URL = 'https://soliat-fc-website.onrender.com/api/news';

const NewsForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('❌ You must be logged in to post news.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage('❌ Title and content are required');
      return;
    }

    try {
      await axios.post(
        API_BASE_URL,
        { title, content, author },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage('✅ News posted successfully');
      setTitle('');
      setContent('');
      setAuthor('');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Post news error:', error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Server error';
      setMessage('❌ Failed to post news: ' + errMsg);
    }
  };

  return (
    <div className="news-form-container">
      <h2>Post News</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="news-form">
        <input
          className="news-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        /><br />
        <textarea
          className="news-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
        ></textarea><br />
        <input
          className="news-input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author (optional)"
        /><br />
        <button className="news-button" type="submit">Post</button>
      </form>
    </div>
  );
};

export default NewsForm;
