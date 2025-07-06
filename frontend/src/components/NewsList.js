import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './News.css';

const API_URL = 'https://soliat-fc-backend-production.up.railway.app/api/news';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setNews(res.data))
      .catch((err) => console.error('Failed to load news:', err));
  }, []);

  const toggleReadMore = (id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="news-list-container">
      <h2>Latest News</h2>
      {news.length === 0 && <p>No news available.</p>}
      {news.map((item) => (
        <div key={item._id} className="news-item">
          <h3>{item.title}</h3>
          <p>
            {expanded[item._id]
              ? item.content
              : item.content.length > 100
                ? `${item.content.slice(0, 100)}...`
                : item.content
            }
          </p>
          {item.content.length > 100 && (
            <span
              className="read-more"
              onClick={() => toggleReadMore(item._id)}
            >
              {expanded[item._id] ? 'Show less' : 'Read more'}
            </span>
          )}
          <br />
          <small>By {item.author || 'Unknown'} on {new Date(item.createdAt || item.date).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
};

export default NewsList;

