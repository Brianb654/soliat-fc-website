console.log("✅ server.js is starting...");

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Make sure this is BEFORE all routes

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Default route
app.get('/', (req, res) => {
  res.send('Soliat FC Backend is running');
});

app.post('/api/test', (req, res) => {
  console.log('🔍 Received test body:', req.body);
  res.json({ received: req.body });
});


// ✅ Routes
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));       // 🔐 Login/Register
app.use('/api/admin', require('./routes/adminRoutes'));     // 🔐 Admin controls

// ⚠️ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
