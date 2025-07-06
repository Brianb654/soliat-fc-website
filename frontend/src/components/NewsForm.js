import React, { useState } from 'react';
import { postNews } from '../api/newsApi';
import './News.css';

const NewsForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage('❌ Title and content are required');
      return;
    }

    try {
      await postNews({ title, content, author });
      setMessage('✅ News posted successfully');
      setTitle('');
      setContent('');
      setAuthor('');
    } catch (error) {
      console.error('Post news error:', error);
      setMessage('❌ Failed to post news: ' + (error.message || 'Server error'));
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
