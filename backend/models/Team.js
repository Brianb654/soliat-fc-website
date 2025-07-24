const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  goalsA: { type: Number, required: true },
  goalsB: { type: Number, required: true },
  matchesPlayed: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
