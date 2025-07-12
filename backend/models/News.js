const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  author: { type: String, default: 'Anonymous', trim: true },
  image: { type: String, default: '', trim: true }, // ✅ Image field
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
