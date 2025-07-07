const express = require('express');
const router = express.Router();
const News = require('../models/News');

// GET all news articles
router.get('/', async (req, res) => {
  try {
    const newsList = await News.find().sort({ date: -1 });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// POST a new news article
router.post('/', async (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const newNews = new News({ title, content, author });
    const savedNews = await newNews.save();
    res.status(201).json(savedNews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save news' });
  }
});

module.exports = router;
