// models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  goalsA: { type: Number, required: true },
  goalsB: { type: Number, required: true },
  date: { type: Date, default: Date.now },

  // Short version fields
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: false },
  weekNumber: { type: Number, required: false }
});

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
