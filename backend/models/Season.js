// models/Season.js
const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: Date,
  endDate: Date
});

module.exports = mongoose.models.Season || mongoose.model('Season', seasonSchema);
