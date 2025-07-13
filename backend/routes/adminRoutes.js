const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ✅ Still correct
const { protect, isAdmin } = require('../middleware/authMiddleware');

// 🔐 Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ✅ TEMPORARY: Create initial admin (delete after use)
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const newUser = await User.create({
      name,
      email,
      password, // 🔁 No need to hash manually — model handles it
      role: 'admin',
    });

    res.status(201).json({ message: '✅ Admin created successfully' });
  } catch (err) {
    console.error('❌ Admin registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin & Editor Login with logs
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Trying to log in:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Email not found in DB:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password); // ✅ Use method in model
    if (!isMatch) {
      console.log('❌ Password did not match for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', user.email, '| Role:', user.role);

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🧪 Test route
router.get('/test', (req, res) => {
  res.json({ message: '✅ Admin route working!' });
});

// ✅ Create Editor (Admin only)
router.post('/create-editor', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('➡️ Creating editor with:', { name, email });

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const editor = await User.create({
      name,
      email,
      password, // ✅ Let model hash it
      role: 'editor',
    });

    res.status(201).json({
      message: '✅ Editor created successfully',
      editor: {
        id: editor._id,
        name: editor.name,
        email: editor.email,
        role: editor.role,
      },
    });
  } catch (err) {
    console.error('❌ Create editor error:', err.stack || err.message);
    res.status(500).json({ message: 'Server error while creating editor' });
  }
});

// ✅ Get all users (Admins only)
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
