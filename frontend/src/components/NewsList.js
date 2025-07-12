import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './News.css';

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWhatsapp,
  faFacebookF,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons'; // ✅ 3-circle share icon

const API_URL = 'https://soliat-fc-website.onrender.com/api/news';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [showShareFor, setShowShareFor] = useState(null);
  const [loginNotice, setLoginNotice] = useState('');
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = localStorage.getItem('authToken');
  const canEdit = userInfo?.role === 'admin' || userInfo?.role === 'editor';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(API_URL);
        setNews(res.data.news || res.data);
      } catch (err) {
        console.error('❌ Failed to load news:', err);
      }
    };

    fetchNews();
  }, []);

  const toggleReadMore = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleShareOptions = (id) => {
    setShowShareFor((prev) => (prev === id ? null : id));
  };

  const handlePostClick = () => {
    if (canEdit) {
      navigate('/post-news');
    } else {
      setLoginNotice('⚠️ Please log in to post news.');
      navigate('/admin/login');
    }
  };

  const handleEdit = (item) => {
    navigate('/post-news', { state: { newsToEdit: item } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news item?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('❌ Deletion failed:', err);
    }
  };

  const encode = encodeURIComponent;

  return (
    <div className="news-list-container">
      <h2>Latest News</h2>

      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button onClick={handlePostClick} className="news-button">
          ➕ Post News
        </button>
      </div>

      {loginNotice && <p className="login-notice">{loginNotice}</p>}

      {news.length === 0 ? (
        <p>No news available.</p>
      ) : (
        news.map((item) => {
          const shareUrl = window.location.origin + '/news';
          const shareText = `${item.title} - Read more on Soliat FC website!`;

          return (
            <div key={item._id} className="news-item">
              <h3>{item.title}</h3>

              {item.image && (
                <img
                  src={item.image}
                  alt={`News: ${item.title}`}
                  className="news-image"
                />
              )}

              <p>
                {expanded[item._id]
                  ? item.content
                  : item.content.length > 100
                  ? `${item.content.slice(0, 100)}...`
                  : item.content}
              </p>

              {item.content.length > 100 && (
                <span
                  className="read-more"
                  onClick={() => toggleReadMore(item._id)}
                >
                  {expanded[item._id] ? 'Show less' : 'Read more'}
                </span>
              )}

              <small>
                By {item.author || 'Unknown'} on{' '}
                {new Date(item.createdAt || item.date).toLocaleDateString()}
              </small>

              <div style={{ marginTop: '0.8rem' }}>
                {/* Share toggle button */}
                <button
                  onClick={() => toggleShareOptions(item._id)}
                  className="news-button share-button"
                  title="Share this news"
                >
                  <FontAwesomeIcon icon={faShareNodes} /> Share
                </button>

                {/* Share icons */}
                {showShareFor === item._id && (
                  <div className="share-options" style={{ marginTop: '0.5rem' }}>
                    <a
                      href={`https://wa.me/?text=${encode(shareText)}%20${encode(
                        shareUrl
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-button share-button"
                      style={{ backgroundColor: '#25D366' }}
                      title="Share on WhatsApp"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encode(
                        shareUrl
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-button share-button"
                      style={{ backgroundColor: '#3b5998' }}
                      title="Share on Facebook"
                    >
                      <FontAwesomeIcon icon={faFacebookF} />
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${encode(
                        shareText
                      )}&url=${encode(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-button share-button"
                      style={{ backgroundColor: '#1DA1F2' }}
                      title="Share on X (Twitter)"
                    >
                      <FontAwesomeIcon icon={faXTwitter} />
                    </a>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="news-actions" style={{ marginTop: '0.8rem' }}>
                  <button onClick={() => handleEdit(item)} className="news-button">
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="news-button danger"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default NewsList;
