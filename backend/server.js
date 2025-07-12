console.log("✅ server.js is starting...");

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ CORS Setup (allow local + Vercel frontend + Vercel previews)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman or mobile apps

    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.227.92:3000',
      'https://soliat-fc.vercel.app'
    ];

    const isVercelPreview = origin.endsWith('.vercel.app');

    if (allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json()); // for parsing application/json

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Default route
app.get('/', (req, res) => {
  res.send('🌍 Soliat FC Backend is running');
});

// 🧪 Test route (optional)
app.post('/api/test', (req, res) => {
  console.log('🔍 Test body:', req.body);
  res.json({ received: req.body });
});

// ✅ API Routes
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));   // login/register
app.use('/api/admin', require('./routes/adminRoutes')); // admin

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ❗ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error stack:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
