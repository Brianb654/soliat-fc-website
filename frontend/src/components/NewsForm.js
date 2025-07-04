import React, { useState } from 'react';
import axios from 'axios';
import './News.css';

const NewsForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setMessage('❌ Title and content are required');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/news', { title, content, author });
      setMessage('✅ News posted successfully');
      setTitle('');
      setContent('');
      setAuthor('');
    } catch {
      setMessage('❌ Failed to post news');
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
        /><br/>
        <textarea
          className="news-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
        ></textarea><br/>
        <input
          className="news-input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author (optional)"
        /><br/>
        <button className="news-button" type="submit">Post</button>
      </form>
    </div>
  );
};

export default NewsForm;

