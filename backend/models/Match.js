const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  goalsA: { type: Number, required: true },
  goalsB: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

// ✅ Fix OverwriteModelError
module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
