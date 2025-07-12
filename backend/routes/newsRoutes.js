const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { protect, isEditorOrAdmin, isAdmin } = require('../middleware/authMiddleware');

// ✅ GET all news (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const newsList = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments();

    res.json({
      news: newsList,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('❌ Error fetching news:', err);
    res.status(500).json({ error: 'Server error while fetching news' });
  }
});

// ✅ POST news (admin/editor only)
router.post('/', protect, isEditorOrAdmin, async (req, res) => {
  try {
    const { title, content, author, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const news = new News({
      title: title.trim(),
      content: content.trim(),
      author: (author || req.user?.name || 'Unknown').trim(),
      image,
    });

    const savedNews = await news.save();
    res.status(201).json(savedNews);
  } catch (err) {
    console.error('❌ Error saving news:', err);
    res.status(500).json({ error: 'Server error while saving news' });
  }
});

// ✅ PUT/edit news (admin/editor only) — UPDATED IMAGE HANDLING
router.put('/:id', protect, isEditorOrAdmin, async (req, res) => {
  try {
    const { title, content, author, image } = req.body;

    const updatedFields = {
      ...(title && { title: title.trim() }),
      ...(content && { content: content.trim() }),
      ...(author && { author: author.trim() }),
    };

    // ✅ Allow updating the image even if it's an empty string
    if (image !== undefined) {
      updatedFields.image = image;
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(updatedNews);
  } catch (err) {
    console.error('❌ Error updating news:', err);
    res.status(500).json({ error: 'Server error while updating news' });
  }
});

// ✅ DELETE news (admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json({ message: '✅ News deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting news:', err);
    res.status(500).json({ error: 'Server error while deleting news' });
  }
});

module.exports = router;
