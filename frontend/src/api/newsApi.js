import axios from 'axios';

// ✅ Correct Railway backend URL
//onst API_URL = 'https://soliat-fc-backend-production.up.railway.app/api/news';
// src/api.js or similar
const API_BASE_URL = 'https://soliat-fc-website.onrender.com'; // NOT localhost


// POST news
export const postNews = async (newsData) => {
  return axios.post(API_URL, newsData);
};

// GET news
export const getNews = async () => {
  return axios.get(API_URL);
};
