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
    console.error('❌ Error fetching teams:', error);
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
      if (!data.name) {
        return res.status(400).json({ message: 'Team name is required' });
      }
      const team = new Team({ name: data.name });
      await team.save();
      res.json(team);
    }
  } catch (error) {
    console.error('❌ Error adding team(s):', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔁 POST /api/teams/rebuild — Rebuild league table
router.post('/rebuild', async (req, res) => {
  try {
    // 1. Reset all teams
    await Team.updateMany({}, {
      $set: {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0
      }
    });

    // 2. Recalculate stats from matches
    const matches = await Match.find();
    for (const match of matches) {
      const { teamA, teamB, goalsA, goalsB } = match;

      const teamAData = await Team.findOne({ name: new RegExp(`^${teamA}$`, 'i') });
      const teamBData = await Team.findOne({ name: new RegExp(`^${teamB}$`, 'i') });

      if (!teamAData || !teamBData) continue;

      // Update goals and matches
      teamAData.goalsFor += goalsA;
      teamAData.goalsAgainst += goalsB;
      teamAData.matchesPlayed += 1;

      teamBData.goalsFor += goalsB;
      teamBData.goalsAgainst += goalsA;
      teamBData.matchesPlayed += 1;

      // Win/Draw/Loss and Points
      if (goalsA > goalsB) {
        teamAData.wins += 1;
        teamAData.points += 3;
        teamBData.losses += 1;
      } else if (goalsB > goalsA) {
        teamBData.wins += 1;
        teamBData.points += 3;
        teamAData.losses += 1;
      } else {
        teamAData.draws += 1;
        teamBData.draws += 1;
        teamAData.points += 1;
        teamBData.points += 1;
      }

      // Goal difference
      teamAData.goalDifference = teamAData.goalsFor - teamAData.goalsAgainst;
      teamBData.goalDifference = teamBData.goalsFor - teamBData.goalsAgainst;

      await teamAData.save();
      await teamBData.save();
    }

    res.json({ message: '✅ League table rebuilt successfully.' });
  } catch (err) {
    console.error('❌ Error rebuilding table:', err);
    res.status(500).json({ message: 'Server error during rebuild' });
  }
});

module.exports = router;
