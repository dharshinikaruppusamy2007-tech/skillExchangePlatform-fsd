const mongoose = require('mongoose');
const Review = require('../models/Review');
const Session = require('../models/Session');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const MAX_COMMENT = 1000;

const populateReview = (query) =>
  query
    .populate('reviewer', 'name profileImage')
    .populate('reviewee', 'name profileImage')
    .populate('skill', 'skillName category');

// @desc    Submit a review for a completed session
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;

    if (!sessionId || !isValidObjectId(sessionId)) {
      return res.status(400).json({ message: 'A valid session is required' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Reviews are only allowed once the session actually happened
    if (session.status !== 'Completed') {
      return res
        .status(400)
        .json({ message: 'You can only review a completed session' });
    }

    // Only participants may review
    const isMentor = session.mentor.equals(req.user.id);
    const isLearner = session.learner.equals(req.user.id);
    if (!isMentor && !isLearner) {
      return res.status(403).json({ message: 'Only session participants can leave a review' });
    }

    // The reviewer is always the logged-in user (from JWT), never trusted
    // from the frontend. Reviewee is the other participant.
    const reviewer = req.user.id;
    const reviewee = isMentor ? session.learner : session.mentor;

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
    }

    const commentValue = comment !== undefined && comment !== null ? String(comment).trim() : '';
    if (commentValue.length > MAX_COMMENT) {
      return res.status(400).json({ message: `Comment must be ${MAX_COMMENT} characters or fewer` });
    }

    // Prevent duplicate reviews (also enforced by a unique index)
    const existing = await Review.findOne({ reviewer, session: sessionId });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this session' });
    }

    const review = await Review.create({
      reviewer,
      reviewee,
      exchangeRequest: session.exchangeRequest,
      session: session._id,
      skill: session.skill,
      rating: ratingValue,
      comment: commentValue,
    });

    const populated = await populateReview(Review.findById(review._id));
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already reviewed this session' });
    }
    console.error('Create review error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get reviews received by a user (with rating summary)
// @route   GET /api/reviews/user/:userId
// @access  Private
const getReviewsForUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.userId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reviews = await populateReview(
      Review.find({ reviewee: req.params.userId }).sort({ createdAt: -1 })
    );

    const distribution = await Review.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(req.params.userId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    for (const row of distribution) {
      counts[row._id] = row.count;
      total += row.count;
      sum += row._id * row.count;
    }

    res.status(200).json({
      reviews,
      summary: {
        count: total,
        average: total ? Number((sum / total).toFixed(1)) : 0,
        distribution: [1, 2, 3, 4, 5].map((stars) => ({ stars, count: counts[stars] })),
      },
    });
  } catch (error) {
    console.error('Get user reviews error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get reviews for a skill
// @route   GET /api/reviews/skill/:skillId
// @access  Private
const getReviewsForSkill = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.skillId)) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const reviews = await populateReview(
      Review.find({ skill: req.params.skillId }).sort({ createdAt: -1 })
    );

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get skill reviews error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get the reviews for a session
// @route   GET /api/reviews/session/:sessionId
// @access  Private
const getReviewsForSession = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.sessionId)) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const reviews = await populateReview(
      Review.find({ session: req.params.sessionId }).sort({ createdAt: -1 })
    );

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get session reviews error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get reviews written by the logged-in user
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await populateReview(
      Review.find({ reviewer: req.user.id }).sort({ createdAt: -1 })
    );
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get my reviews error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Delete a review (author or admin only)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.reviewer.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own review' });
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  createReview,
  getReviewsForUser,
  getReviewsForSkill,
  getReviewsForSession,
  getMyReviews,
  deleteReview,
};