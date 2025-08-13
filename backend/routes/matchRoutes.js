const express = require('express');
const axios = require('axios');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');
const { protect, isEditorOrAdmin } = require('../middleware/authMiddleware');

// ✅ NEW: GET all matches — public route
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 }); // latest first
    res.json(matches);
  } catch (error) {
    console.error('❌ Error fetching matches:', error.message);
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
});

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

// ✏️ PUT update match result with date handling
router.put('/:id', protect, isEditorOrAdmin, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const { teamA, teamB, goalsA, goalsB, date } = req.body;

    if (!teamA || !teamB || goalsA == null || goalsB == null) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Reverse old result
    const teamAOld = await Team.findOne({ name: { $regex: new RegExp(`^${match.teamA}$`, 'i') } });
    const teamBOld = await Team.findOne({ name: { $regex: new RegExp(`^${match.teamB}$`, 'i') } });

    if (!teamAOld || !teamBOld) {
      return res.status(404).json({ message: 'One or both original teams not found' });
    }

    // Reverse goals and stats
    teamAOld.goalsFor -= match.goalsA;
    teamAOld.goalsAgainst -= match.goalsB;
    teamBOld.goalsFor -= match.goalsB;
    teamBOld.goalsAgainst -= match.goalsA;

    teamAOld.goalDifference = teamAOld.goalsFor - teamAOld.goalsAgainst;
    teamBOld.goalDifference = teamBOld.goalsFor - teamBOld.goalsAgainst;

    if (match.goalsA > match.goalsB) {
      teamAOld.points -= 3;
      teamAOld.wins = Math.max((teamAOld.wins || 1) - 1, 0);
      teamBOld.losses = Math.max((teamBOld.losses || 1) - 1, 0);
    } else if (match.goalsB > match.goalsA) {
      teamBOld.points -= 3;
      teamBOld.wins = Math.max((teamBOld.wins || 1) - 1, 0);
      teamAOld.losses = Math.max((teamAOld.losses || 1) - 1, 0);
    } else {
      teamAOld.points -= 1;
      teamBOld.points -= 1;
      teamAOld.draws = Math.max((teamAOld.draws || 1) - 1, 0);
      teamBOld.draws = Math.max((teamBOld.draws || 1) - 1, 0);
    }

    await teamAOld.save();
    await teamBOld.save();

    // Update match fields including date
    match.teamA = teamA.trim();
    match.teamB = teamB.trim();
    match.goalsA = goalsA;
    match.goalsB = goalsB;

    if (date) {
      const newDate = new Date(date);
      if (!isNaN(newDate)) {
        match.date = newDate;
      } else {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    }

    await match.save();

    // Apply new result
    const teamANew = await Team.findOne({ name: { $regex: new RegExp(`^${teamA}$`, 'i') } });
    const teamBNew = await Team.findOne({ name: { $regex: new RegExp(`^${teamB}$`, 'i') } });

    if (!teamANew || !teamBNew) {
      return res.status(404).json({ message: 'One or both new teams not found' });
    }

    teamANew.goalsFor += goalsA;
    teamANew.goalsAgainst += goalsB;
    teamBNew.goalsFor += goalsB;
    teamBNew.goalsAgainst += goalsA;

    teamANew.goalDifference = teamANew.goalsFor - teamANew.goalsAgainst;
    teamBNew.goalDifference = teamBNew.goalsFor - teamBNew.goalsAgainst;

    if (goalsA > goalsB) {
      teamANew.points += 3;
      teamANew.wins = (teamANew.wins || 0) + 1;
      teamBNew.losses = (teamBNew.losses || 0) + 1;
    } else if (goalsB > goalsA) {
      teamBNew.points += 3;
      teamBNew.wins = (teamBNew.wins || 0) + 1;
      teamANew.losses = (teamANew.losses || 0) + 1;
    } else {
      teamANew.points += 1;
      teamBNew.points += 1;
      teamANew.draws = (teamANew.draws || 0) + 1;
      teamBNew.draws = (teamBNew.draws || 0) + 1;
    }

    await teamANew.save();
    await teamBNew.save();

    res.json({ message: '✏️ Match result updated and league table adjusted.', match });
  } catch (error) {
    console.error('❌ Error updating match:', error.message);
    res.status(500).json({ message: 'Server error while updating match' });
  }
});

// ❌ DELETE match
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

    // Reverse goals and stats
    teamAData.goalsFor -= goalsA;
    teamAData.goalsAgainst -= goalsB;
    teamBData.goalsFor -= goalsB;
    teamBData.goalsAgainst -= goalsA;

    teamAData.goalDifference = teamAData.goalsFor - teamAData.goalsAgainst;
    teamBData.goalDifference = teamBData.goalsFor - teamBData.goalsAgainst;

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

    const rebuildUrl = 'https://soliat-fc-website.onrender.com/api/teams/rebuild';
    await axios.post(rebuildUrl);

    res.json({ message: '🗑 Match deleted, stats reversed, league rebuilt' });
  } catch (error) {
    console.error('❌ Error deleting match:', error.message);
    res.status(500).json({ message: 'Server error during match deletion' });
  }
});

// Bulk create match results — POST /api/matches/bulk
router.post('/bulk', protect, isEditorOrAdmin, async (req, res) => {
  try {
    const matches = req.body;

    if (!Array.isArray(matches) || matches.length === 0) {
      return res.status(400).json({ message: 'No matches submitted' });
    }

    // Validate and normalize input, map to schema fields
    const preparedMatches = [];
    for (const m of matches) {
      const { teamA, teamB, goalsA, goalsB, date } = m;

      if (!teamA || !teamB || goalsA == null || goalsB == null) {
        return res.status(400).json({ message: 'All fields required for each match' });
      }

      if (teamA.trim() === teamB.trim()) {
        return res.status(400).json({ message: 'Teams must be different' });
      }

      preparedMatches.push({
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        goalsA,
        goalsB,
        date: date ? new Date(date) : new Date(),
      });
    }

    // Filter out duplicates already in DB
    const filteredMatches = [];
    for (const match of preparedMatches) {
      const exists = await Match.findOne({
        teamA: match.teamA,
        teamB: match.teamB,
        goalsA: match.goalsA,
        goalsB: match.goalsB,
        date: match.date,
      });
      if (!exists) filteredMatches.push(match);
    }

    if (filteredMatches.length === 0) {
      return res.status(409).json({ message: 'All matches already exist' });
    }

    // Insert many at once
    const insertedMatches = await Match.insertMany(filteredMatches);

    // Update team stats for all inserted matches
    for (const match of insertedMatches) {
      const teamAData = await Team.findOne({ name: { $regex: new RegExp(`^${match.teamA}$`, 'i') } });
      const teamBData = await Team.findOne({ name: { $regex: new RegExp(`^${match.teamB}$`, 'i') } });

      if (!teamAData || !teamBData) {
        // Optional: could decide to rollback inserted matches here
        console.warn(`Teams not found for match ${match._id}`);
        continue;
      }

      teamAData.goalsFor += match.goalsA;
      teamAData.goalsAgainst += match.goalsB;
      teamBData.goalsFor += match.goalsB;
      teamBData.goalsAgainst += match.goalsA;

      teamAData.goalDifference = teamAData.goalsFor - teamAData.goalsAgainst;
      teamBData.goalDifference = teamBData.goalsFor - teamBData.goalsAgainst;

      if (match.goalsA > match.goalsB) {
        teamAData.points += 3;
        teamAData.wins = (teamAData.wins || 0) + 1;
        teamBData.losses = (teamBData.losses || 0) + 1;
      } else if (match.goalsB > match.goalsA) {
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
    }

    res.status(201).json({ message: `Bulk insert successful: ${insertedMatches.length} matches added.` });
  } catch (error) {
    console.error('❌ Bulk submission error:', error);
    res.status(500).json({ message: 'Server error during bulk match upload' });
  }
});

module.exports = router;