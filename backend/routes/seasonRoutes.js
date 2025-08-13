const express = require('express');
const router = express.Router();
const Season = require('../models/Season');

// Create new season
router.post('/', async (req, res) => {
  try {
    const season = new Season(req.body);
    await season.save();
    res.status(201).json(season);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all seasons
router.get('/', async (req, res) => {
  try {
    const seasons = await Season.find().sort({ startDate: 1 });
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single season by id
router.get('/:id', async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) return res.status(404).json({ error: 'Season not found' });
    res.json(season);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update season by id
router.put('/:id', async (req, res) => {
  try {
    const season = await Season.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!season) return res.status(404).json({ error: 'Season not found' });
    res.json(season);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete season by id
router.delete('/:id', async (req, res) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.id);
    if (!season) return res.status(404).json({ error: 'Season not found' });
    res.json({ message: 'Season deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
