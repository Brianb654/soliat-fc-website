const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ✅ TEMPORARY: Create initial admin (delete after first use)
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    res.status(201).json({ message: '✅ Admin created successfully' });
  } catch (err) {
    console.error('Admin registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🧪 Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin route working!' });
});

// ✅ Create Editor (only for logged-in admins)
router.post('/create-editor', protect, isAdmin, async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const editor = await User.create({
    username,
    email,
    password: hashedPassword,
    role: 'editor',
  });

  res.status(201).json({
    message: 'Editor created',
    editor: {
      id: editor._id,
      username: editor.username,
      role: editor.role,
    },
  });
});

module.exports = router;
