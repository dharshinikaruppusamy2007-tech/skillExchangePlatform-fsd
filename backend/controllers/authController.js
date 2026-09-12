const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to avoid leaking the password hash in responses
const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// Creates a signed JWT valid for 30 days
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check whether the email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });

    // Return the token along with the safe user data so the user is logged in
    res.status(201).json({
      token: generateToken(user._id),
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Login an existing user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // select('+password') re-enables a field that is hidden by default
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Generic message so we do not reveal whether the email exists
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get the currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(toSafeUser(user));
  } catch (error) {
    console.error('Get me error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Demo only: log the request, email sending is not implemented yet
    if (user) {
      console.log(`Password reset requested for: ${user.email}`);
    }

    // Always respond with the same message so we do not leak whether the email exists
    res.status(200).json({
      message: 'If that email is registered, a password reset link will be sent to it.',
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
};