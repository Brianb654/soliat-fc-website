import axios from 'axios';

// Use your actual deployed backend URL here
const API_URL = 'https://soliatfc-backend.up.railway.app/api/news';

export const postNews = async (newsData) => {
  return axios.post(API_URL, newsData);
};
