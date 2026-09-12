const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;