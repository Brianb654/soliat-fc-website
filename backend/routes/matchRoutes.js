const express = require('express');
const axios = require('axios');
const router = express.Router();
const Match = require('../models/Match');  
const Team = require('../models/Team');
const { protect, isEditorOrAdmin } = require('../middleware/authMiddleware');

// 📝 POST match result — only for admin/editor
router.post('/', protect, isEditorOrAdmin, async (req, res) => {
  try {
    let { teamA, teamB, goalsA, goalsB } = req.body;

    if (!teamA || !teamB || goalsA == null || goalsB == null) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    teamA = teamA.trim();
    teamB = teamB.trim();

    if (teamA === teamB) {
      return res.status(400).json({ message: 'Teams must be different' });
    }

    const existing = await Match.findOne({ teamA, teamB, goalsA, goalsB });
    if (existing) {
      return res.status(409).json({ message: 'Match already recorded' });
    }

    const match = new Match({ teamA, teamB, goalsA, goalsB });
    await match.save();

    const teamAData = await Team.findOne({ name: { $regex: new RegExp(`^${teamA}$`, 'i') } });
    const teamBData = await Team.findOne({ name: { $regex: new RegExp(`^${teamB}$`, 'i') } });

    if (!teamAData || !teamBData) {
      return res.status(404).json({ message: 'One or both teams not found in database' });
    }

    // Update goals
    teamAData.goalsFor += goalsA;
    teamAData.goalsAgainst += goalsB;
    teamBData.goalsFor += goalsB;
    teamBData.goalsAgainst += goalsA;

    teamAData.goalDifference = teamAData.goalsFor - teamAData.goalsAgainst;
    teamBData.goalDifference = teamBData.goalsFor - teamBData.goalsAgainst;

    // Assign points + update W/D/L
    if (goalsA > goalsB) {
      teamAData.points += 3;
      teamAData.wins = (teamAData.wins || 0) + 1;
      teamBData.losses = (teamBData.losses || 0) + 1;
    } else if (goalsB > goalsA) {
      teamBData.points += 3;
      teamBData.wins = (teamBData.wins || 0) + 1;
      teamAData.losses = (teamAData.losses || 0) + 1;
    } else {
      teamAData.points += 1;
      teamBData.points += 1;
      teamAData.draws = (teamAData.draws || 0) + 1;
      teamBData.draws = (teamBData.draws || 0) + 1;
    }

    teamAData.matchesPlayed = (teamAData.matchesPlayed || 0) + 1;
    teamBData.matchesPlayed = (teamBData.matchesPlayed || 0) + 1;

    await teamAData.save();
    await teamBData.save();

    res.status(201).json({ message: '✅ Match saved and table updated.', match });
  } catch (error) {
    console.error('❌ Error saving match:', error.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ❌ DELETE a match and auto-rebuild league
router.delete('/:id', protect, isEditorOrAdmin, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const { teamA, teamB, goalsA, goalsB } = match;

    const teamAData = await Team.findOne({ name: { $regex: new RegExp(`^${teamA}$`, 'i') } });
    const teamBData = await Team.findOne({ name: { $regex: new RegExp(`^${teamB}$`, 'i') } });

    if (!teamAData || !teamBData) {
      return res.status(404).json({ message: 'One or both teams not found' });
    }

    // Reverse goals
    teamAData.goalsFor -= goalsA;
    teamAData.goalsAgainst -= goalsB;
    teamBData.goalsFor -= goalsB;
    teamBData.goalsAgainst -= goalsA;

    // Reverse goal difference
    teamAData.goalDifference = teamAData.goalsFor - teamAData.goalsAgainst;
    teamBData.goalDifference = teamBData.goalsFor - teamBData.goalsAgainst;

    // Reverse points and W/D/L
    if (goalsA > goalsB) {
      teamAData.points -= 3;
      teamAData.wins = Math.max((teamAData.wins || 1) - 1, 0);
      teamBData.losses = Math.max((teamBData.losses || 1) - 1, 0);
    } else if (goalsB > goalsA) {
      teamBData.points -= 3;
      teamBData.wins = Math.max((teamBData.wins || 1) - 1, 0);
      teamAData.losses = Math.max((teamAData.losses || 1) - 1, 0);
    } else {
      teamAData.points -= 1;
      teamBData.points -= 1;
      teamAData.draws = Math.max((teamAData.draws || 1) - 1, 0);
      teamBData.draws = Math.max((teamBData.draws || 1) - 1, 0);
    }

    teamAData.matchesPlayed = Math.max((teamAData.matchesPlayed || 1) - 1, 0);
    teamBData.matchesPlayed = Math.max((teamBData.matchesPlayed || 1) - 1, 0);

    await teamAData.save();
    await teamBData.save();
    await match.deleteOne();

    const rebuildUrl = 'https://soliat-fc-website.onrender.com.app/api/teams/rebuild';
    await axios.post(rebuildUrl);

    res.json({ message: '🗑 Match deleted, stats reversed, league rebuilt' });
  } catch (error) {
    console.error('❌ Error deleting match:', error.message);
    res.status(500).json({ message: 'Server error during match deletion' });
  }
});

module.exports = router;
