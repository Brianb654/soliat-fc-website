const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/authMiddleware');


// Add this at the top of adminRoutes.js (just for testing in browser)
router.get('/test', (req, res) => {
  res.json({ message: 'Admin route working!' });
});


// @route POST /api/admin/create-editor
router.post('/create-editor', protect, isAdmin, async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const editor = await User.create({
    username,
    email,
    password,
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
