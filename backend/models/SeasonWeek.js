// models/SeasonWeek.js
const mongoose = require('mongoose');

const seasonWeekSchema = new mongoose.Schema({
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  weekNumber: { type: Number, required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.models.SeasonWeek || mongoose.model('SeasonWeek', seasonWeekSchema);
