const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');

// POST match result
router.post('/', async (req, res) => {
  const { teamA, teamB, goalsA, goalsB } = req.body;

  // Save match
  const match = new Match({ teamA, teamB, goalsA, goalsB });
  await match.save();

  // Update teams
  const teamAData = await Team.findOne({ name: teamA });
  const teamBData = await Team.findOne({ name: teamB });

  if (!teamAData || !teamBData) {
    return res.status(400).json({ error: 'One or both teams not found' });
  }

  // Update stats
  teamAData.goalsFor += goalsA;
  teamAData.goalsAgainst += goalsB;
  teamAData.goalDifference = teamAData.goalsFor - teamAData.goalsAgainst;

  teamBData.goalsFor += goalsB;
  teamBData.goalsAgainst += goalsA;
  teamBData.goalDifference = teamBData.goalsFor - teamBData.goalsAgainst;

  if (goalsA > goalsB) teamAData.points += 3;
  else if (goalsB > goalsA) teamBData.points += 3;
  else {
    teamAData.points += 1;
    teamBData.points += 1;
  }

  await teamAData.save();
  await teamBData.save();

  res.json(match);
});

module.exports = router;
