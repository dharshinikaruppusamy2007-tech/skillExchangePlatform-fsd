const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes: verifies the JWT from the Authorization header
const protect = async (req, res, next) => {
  try {
    let token;

    // Expected header format: Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Deactivated accounts may not use the platform
      if (user.active === false) {
        return res.status(401).json({ message: 'Not authorized, account is deactivated' });
      }

      // Attach the logged-in user to the request for use in controllers
      req.user = { id: user._id, email: user.email, role: user.role };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Requires an authenticated ADMIN. Must be used after `protect`.
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, please log in' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, requireAdmin };