console.log("✅ server.js is starting...");

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ✅ Improved CORS Setup to support Vercel previews
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow mobile apps, Postman, etc.

    const allowedOrigins = [
      'http://localhost:3000',
      'https://soliat-fc.vercel.app',
    ];

    // ✅ Allow any Vercel preview deployment
    const isVercelPreview = origin.endsWith('.vercel.app');

    if (allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json()); // Parse JSON requests

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Default route
app.get('/', (req, res) => {
  res.send('Soliat FC Backend is running');
});

// 🧪 Quick test route
app.post('/api/test', (req, res) => {
  console.log('🔍 Received test body:', req.body);
  res.json({ received: req.body });
});

// ✅ API Routes
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));       // 🔐 Login/Register
app.use('/api/admin', require('./routes/adminRoutes'));     // 🔐 Admin controls

// ❗ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ❗ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
