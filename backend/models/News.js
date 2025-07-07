const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
  author: { type: String, default: 'Anonymous', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
