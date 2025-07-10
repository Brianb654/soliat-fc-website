const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔒 Middleware: Protect route (must be logged in)
const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;


     console.log('✅ Authenticated user:', req.user.role);




      return next();
    }

    return res.status(401).json({ message: 'Not authorized: no token' });
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// 🔐 Middleware: Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: insufficient privileges' });
    }
    next();
  };
};

// 🔐 Helpers
const isAdmin = requireRole(['admin']);
const isEditorOrAdmin = requireRole(['admin', 'editor']);

module.exports = {
  protect,
  requireRole,
  isAdmin,
  isEditorOrAdmin,
};
