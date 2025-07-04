const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// GET all teams
router.get('/', async (req, res) => {
  const teams = await Team.find().sort({ points: -1, goalDifference: -1 });
  res.json(teams);
});

// POST new team
// Replace POST route with this:
router.post('/', async (req, res) => {
  const data = req.body;
  if (Array.isArray(data)) {
    const teams = await Team.insertMany(data);
    res.json(teams);
  } else {
    const team = new Team({ name: data.name });
    await team.save();
    res.json(team);
  }
});


module.exports = router;
