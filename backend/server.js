console.log("✅ server.js is starting...");

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ CORS Setup (local + Render/Vercel frontend support + mobile/Postman)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Postman or mobile apps

    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.227.92:3000',
      'https://soliat-fc.vercel.app',
    ];

    const isVercelPreview = origin?.endsWith('.vercel.app');

    if (allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

// Middleware to parse JSON
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Require routes
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
const newsRoutes = require('./routes/newsRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 404 fallback and error handler here...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
