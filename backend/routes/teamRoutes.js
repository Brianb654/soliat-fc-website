const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Match = require('../models/Match');

// 📥 GET all teams — sorted by points and goal difference
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ points: -1, goalDifference: -1 });
    res.json(teams);
  } catch (error) {
    console.error('❌ Error fetching teams:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ➕ POST new team or bulk add
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (Array.isArray(data)) {
      const teams = await Team.insertMany(data);
      res.json(teams);
    } else {
      const team = new Team({ name: data.name });
      await team.save();
      res.json(team);
    }
  } catch (error) {
    console.error('❌ Error adding team(s):', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔁 POST /api/teams/rebuild — Rebuild league table after match deletion or reset
router.post('/rebuild', async (req, res) => {
  try {
    const allTeams = await Team.find();

    // Reset all stats
    for (const team of allTeams) {
      team.points = 0;
      team.goalsFor = 0;
      team.goalsAgainst = 0;
      team.goalDifference = 0;
      team.matchesPlayed = 0;
      await team.save();
    }

    const matches = await Match.find();

    for (const match of matches) {
      const { teamA, teamB, goalsA, goalsB } = match;

      const teamAData = await Team.findOne({ name: { $regex: new RegExp(`^${teamA}$`, 'i') } });
      const teamBData = await Team.findOne({ name: { $regex: new RegExp(`^${teamB}$`, 'i') } });

      if (!teamAData || !teamBData) continue;

      // Update team A
      teamAData.goalsFor += goalsA;
      teamAData.goalsAgainst += goalsB;
      teamAData.goalDifference = teamAData.goalsFor - teamAData.goalsAgainst;
      teamAData.matchesPlayed += 1;

      // Update team B
      teamBData.goalsFor += goalsB;
      teamBData.goalsAgainst += goalsA;
      teamBData.goalDifference = teamBData.goalsFor - teamBData.goalsAgainst;
      teamBData.matchesPlayed += 1;

      // Assign points
      if (goalsA > goalsB) teamAData.points += 3;
      else if (goalsB > goalsA) teamBData.points += 3;
      else {
        teamAData.points += 1;
        teamBData.points += 1;
      }

      await teamAData.save();
      await teamBData.save();
    }

    res.json({ message: '✅ League table rebuilt successfully.' });
  } catch (err) {
    console.error('❌ Error rebuilding table:', err.message);
    res.status(500).json({ message: 'Server error during rebuild' });
  }
});

module.exports = router;

