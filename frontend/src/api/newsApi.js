import axios from 'axios';

// ✅ Base URL for Render backend
const API_BASE_URL = 'https://soliat-fc-website.onrender.com';

// ✅ News API endpoints
const NEWS_URL = `${API_BASE_URL}/api/news`;
const LOGIN_URL = `${API_BASE_URL}/api/admin/login`;

// POST news
export const postNews = async (newsData) => {
  return axios.post(NEWS_URL, newsData);
};

// GET news
export const getNews = async () => {
  return axios.get(NEWS_URL);
};

// ADMIN login
export const loginAdmin = async (credentials) => {
  return axios.post(LOGIN_URL, credentials);
};
