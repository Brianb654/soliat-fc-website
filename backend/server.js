console.log("✅ server.js is starting...");

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// CORS middleware
app.use(cors());

app.use(express.json());

const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Soliat FC Backend is running');
});

// ⚡ Add error handler middleware here
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
