const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  matchesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },       // ✅ Added
  draws: { type: Number, default: 0 },      // ✅ Added
  losses: { type: Number, default: 0 },     // ✅ Added
});

module.exports = mongoose.models.Team || mongoose.model('Team', teamSchema);
