const express = require('express');
const router = express.Router();

const {
  getStats,
  getUsers,
  getUserById,
  updateUser,
  getSkills,
  deleteSkill,
  getExchanges,
  getSessions,
  getReviews,
  deleteReview,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require a valid JWT AND an admin role
router.use(protect, requireAdmin);

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

router.get('/skills', getSkills);
router.delete('/skills/:id', deleteSkill);

router.get('/exchanges', getExchanges);

router.get('/sessions', getSessions);

router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;