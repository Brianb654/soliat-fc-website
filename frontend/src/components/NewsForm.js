import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './News.css';

// Backend API URL
const API_BASE_URL = 'https://soliat-fc-website.onrender.com/api/news';

// Cloudinary Config
const CLOUD_NAME = 'doprcqz4w';
const UPLOAD_PRESET = 'soliat uploads';

const NewsForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingNews = location.state?.newsToEdit;

  const [title, setTitle] = useState(editingNews?.title || '');
  const [content, setContent] = useState(editingNews?.content || '');
  const [author, setAuthor] = useState(editingNews?.author || '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(editingNews?.image || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    if (!image) return existingImage || '';

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(image.type)) {
      setMessage('❌ Only JPG, JPEG, and PNG formats allowed.');
      return '';
    }

    if (image.size > 2 * 1024 * 1024) {
      setMessage('❌ Image size must be under 2MB.');
      return '';
    }

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      return res.data.secure_url;
    } catch (err) {
      console.error('❌ Image upload failed:', err);
      setMessage('❌ Failed to upload image. Try again.');
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    if (!token) {
      setMessage('❌ You must be logged in to post news.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage('❌ Title and content are required.');
      return;
    }

    setLoading(true);
    const imageUrl = await handleImageUpload();
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    const newsData = {
      title,
      content,
      author,
      image: imageUrl,
      // Optional: include today's date
      // date: new Date().toISOString(),
    };

    console.log('🖼️ Image URL:', imageUrl);
    console.log('📬 News Payload:', newsData);

    try {
      const endpoint = editingNews
        ? `${API_BASE_URL}/${editingNews._id}`
        : API_BASE_URL;
      const method = editingNews ? 'put' : 'post';

      await axios[method](endpoint, newsData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(editingNews ? '✅ News updated!' : '✅ News posted!');
      setTitle('');
      setContent('');
      setAuthor('');
      setImage(null);
      setExistingImage('');
      setPreview(null);

      setTimeout(() => navigate('/news'), 1000);
    } catch (error) {
      console.error('❌ Submission error:', error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Server error';
      setMessage('❌ Failed: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setImage(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="news-form-container">
      <h2>{editingNews ? '✏️ Edit News' : '📰 Post News'}</h2>
      {message && <p className="message">{message}</p>}
      {loading && <p className="message">⏳ Please wait...</p>}

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

        {existingImage && !preview && (
          <img
            src={existingImage}
            alt="Current"
            className="preview-image"
          />
        )}

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="preview-image"
          />
        )}

        <input
          type="file"
          className="news-input"
          onChange={handleFileChange}
          accept="image/*"
        /><br />

        <button className="news-button" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : editingNews ? 'Update' : 'Post'}
        </button>

        {/* Share Button */}
        <button
          type="button"
          className="news-button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: title || 'Soliat FC News',
                text: content ? content.slice(0, 100) + '...' : '',
                url: window.location.href,
              }).catch(console.error);
            } else {
              navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Link copied to clipboard!');
              });
            }
          }}
          disabled={!title && !content}
          style={{ marginTop: '1rem', backgroundColor: '#007bff' }}
        >
          🔗 Share
        </button>
      </form>
    </div>
  );
};

export default NewsForm;
