import axios from 'axios';

// ✅ Correct Railway backend URL
const API_URL = 'https://soliat-fc-backend-production.up.railway.app/api/news';

// POST news
export const postNews = async (newsData) => {
  return axios.post(API_URL, newsData);
};

// GET news
export const getNews = async () => {
  return axios.get(API_URL);
};
