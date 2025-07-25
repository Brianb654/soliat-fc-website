// src/components/ManageNews.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import NewsForm from './NewsForm';
import './ManageNews.css';

const API_URL = 'https://soliat-fc-website.onrender.com/api/news';

const ManageNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [error, setError] = useState('');

  const fetchNews = async () => {
    try {
      const res = await axios.get(API_URL);
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNewsList(sorted);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('❌ Failed to load news');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this news article?');
    if (!confirmed) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewsList(newsList.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('❌ Failed to delete news');
    }
  };

  return (
    <div className="manage-news-container">
      <h2 className="manage-news-title">📰 Manage News</h2>

      {/* 🔼 Post News Form */}
      <NewsForm onSuccess={fetchNews} />

      <hr style={{ margin: '2rem 0' }} />

      {/* 📋 News List */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {newsList.length === 0 ? (
        <p>No news articles yet.</p>
      ) : (
        <ul className="news-list">
          {newsList.map((article) => (
            <li key={article._id} className="news-item">
              <div className="news-content">
                <h4>{article.title}</h4>
                <p>{article.content.slice(0, 100)}...</p>
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="news-image"
                  />
                )}
              </div>
              <div className="news-actions">
                <Link to={`/admin/edit-news/${article._id}`} className="edit">
                  ✏️ Edit
                </Link>
                <button className="delete" onClick={() => handleDelete(article._id)}>
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageNews;
