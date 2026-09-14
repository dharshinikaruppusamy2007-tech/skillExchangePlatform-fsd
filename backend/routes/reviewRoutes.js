const express = require('express');
const router = express.Router();

const {
  createReview,
  getReviewsForUser,
  getReviewsForSkill,
  getReviewsForSession,
  getMyReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);
router.get('/user/:userId', protect, getReviewsForUser);
router.get('/skill/:skillId', protect, getReviewsForSkill);
router.get('/session/:sessionId', protect, getReviewsForSession);
router.delete('/:id', protect, deleteReview);

module.exports = router;