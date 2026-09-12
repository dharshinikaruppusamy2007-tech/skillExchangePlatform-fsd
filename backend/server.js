require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// CORS - allow requests from the frontend dev server
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Skill Exchange Platform API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Server error. Please try again.' });
});

const PORT = process.env.PORT || 5000;

// Start the server only after the database connection is established
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});