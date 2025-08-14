const express = require('express');
const router = express.Router();
const SeasonWeek = require('../models/SeasonWeek');

// Create new season week (single)
router.post('/', async (req, res) => {
  try {
    const seasonWeek = new SeasonWeek(req.body);
    await seasonWeek.save();
    res.status(201).json(seasonWeek);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create multiple season weeks at once (bulk insert)
router.post('/bulk', async (req, res) => {
  try {
    const weeks = req.body; // Expecting an array of season week objects

    if (!Array.isArray(weeks)) {
      return res.status(400).json({ error: 'Request body must be an array' });
    }

    const createdWeeks = await SeasonWeek.insertMany(weeks);
    res.status(201).json(createdWeeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all weeks, optionally filtered by seasonId ?seasonId=...
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.seasonId) {
      filter.seasonId = req.query.seasonId;
    }
    const weeks = await SeasonWeek.find(filter).sort({ weekNumber: 1 });
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single week by id
router.get('/:id', async (req, res) => {
  try {
    const week = await SeasonWeek.findById(req.params.id);
    if (!week) return res.status(404).json({ error: 'Week not found' });
    res.json(week);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RESTful route: Get all weeks for a specific season
router.get('/season/:seasonId/weeks', async (req, res) => {
  try {
    const weeks = await SeasonWeek.find({ seasonId: req.params.seasonId }).sort({ weekNumber: 1 });
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update week by id
router.put('/:id', async (req, res) => {
  try {
    const week = await SeasonWeek.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!week) return res.status(404).json({ error: 'Week not found' });
    res.json(week);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete week by id
router.delete('/:id', async (req, res) => {
  try {
    const week = await SeasonWeek.findByIdAndDelete(req.params.id);
    if (!week) return res.status(404).json({ error: 'Week not found' });
    res.json({ message: 'Week deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
