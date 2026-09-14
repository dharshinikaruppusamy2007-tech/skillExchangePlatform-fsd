const mongoose = require('mongoose');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SkillRequest = require('../models/SkillRequest');
const Session = require('../models/Session');
const Review = require('../models/Review');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SAFE_USER_FIELDS = 'name email role active profileImage location skillsToTeach skillsToLearn createdAt';

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalSkills, totalRequests, totalSessions, completedSessions,
      totalReviews, pendingRequests, avgRating] = await Promise.all([
      User.countDocuments({}),
      Skill.countDocuments({}),
      SkillRequest.countDocuments({}),
      Session.countDocuments({}),
      Session.countDocuments({ status: 'Completed' }),
      Review.countDocuments({}),
      SkillRequest.countDocuments({ status: 'pending' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    res.status(200).json({
      totalUsers,
      totalSkills,
      totalRequests,
      totalSessions,
      completedSessions,
      totalReviews,
      pendingRequests,
      averageRating: avgRating[0] ? Number(avgRating[0].avg.toFixed(1)) : 0,
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    List users with optional search and role filter
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const pattern = new RegExp(escapeRegExp(search.trim()), 'i');
      filter.$or = [{ name: pattern }, { email: pattern }];
    }
    if (role && ['user', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .limit(200);

    // Skill counts per user (single aggregation, avoids N+1 queries)
    const counts = await Skill.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((row) => {
      countMap[String(row._id)] = row.count;
    });

    res.status(200).json(
      users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        profileImage: user.profileImage,
        location: user.location,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        createdAt: user.createdAt,
        skillsCount: countMap[String(user._id)] || 0,
      }))
    );
  } catch (error) {
    console.error('Admin get users error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get a single user with their skills (admin)
// @route   GET /api/admin/users/:id
// @access  Private (admin)
const getUserById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.params.id).select(SAFE_USER_FIELDS);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skills = await Skill.find({ userId: user._id }).sort({ createdAt: -1 });
    const teachSkills = skills.filter((s) => s.type === 'teach');
    const learnSkills = skills.filter((s) => s.type === 'learn');

    res.status(200).json({ ...user.toObject(), skills, teachSkills, learnSkills });
  } catch (error) {
    console.error('Admin get user error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Activate / deactivate a user, or change their role (admin)
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
const updateUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { active, role } = req.body;

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role must be "user" or "admin"' });
      }
      user.role = role;
    }

    if (active !== undefined) {
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: 'Active must be a boolean' });
      }
      // Prevent an admin from deactivating their own account
      if (!active && String(user._id) === String(req.user.id)) {
        return res.status(400).json({ message: 'You cannot deactivate your own account' });
      }
      user.active = active;
    }

    await user.save();
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    console.error('Admin update user error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    List all skills (admin)
// @route   GET /api/admin/skills
// @access  Private (admin)
const getSkills = async (req, res) => {
  try {
    const { search, category, level } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const pattern = new RegExp(escapeRegExp(search.trim()), 'i');
      filter.$or = [{ skillName: pattern }, { description: pattern }];
    }
    if (category && category.trim()) {
      filter.category = { $regex: new RegExp(escapeRegExp(category.trim()), 'i') };
    }
    if (level && ['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      filter.proficiency = level;
    }

    const skills = await Skill.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json(skills);
  } catch (error) {
    console.error('Admin get skills error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Delete a skill (admin)
// @route   DELETE /api/admin/skills/:id
// @access  Private (admin)
const deleteSkill = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    await skill.deleteOne();
    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Admin delete skill error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    List all exchange requests (admin)
// @route   GET /api/admin/exchanges
// @access  Private (admin)
const getExchanges = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const requests = await SkillRequest.find(filter)
      .populate('sender', 'name email profileImage')
      .populate('receiver', 'name email profileImage')
      .populate('skill', 'skillName category')
      .populate('offeredSkill', 'skillName category')
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json(requests);
  } catch (error) {
    console.error('Admin get exchanges error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    List all sessions (admin)
// @route   GET /api/admin/sessions
// @access  Private (admin)
const getSessions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['Upcoming', 'Completed', 'Cancelled'].includes(status)) {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .populate('mentor', 'name email profileImage')
      .populate('learner', 'name email profileImage')
      .populate('skill', 'skillName category')
      .sort({ scheduledDate: -1 })
      .limit(200);

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Admin get sessions error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    List all reviews (admin)
// @route   GET /api/admin/reviews
// @access  Private (admin)
const getReviews = async (req, res) => {
  try {
    const { rating } = req.query;
    const filter = {};

    if (rating && Number.isInteger(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5) {
      filter.rating = Number(rating);
    }

    const reviews = await Review.find(filter)
      .populate('reviewer', 'name email profileImage')
      .populate('reviewee', 'name email profileImage')
      .populate('skill', 'skillName category')
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Admin get reviews error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Delete any review (admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (admin)
const deleteReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin delete review error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Analytics aggregates from real database data
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = async (req, res) => {
  try {
    const [usersByMonth, skillsByCategory, requestsByStatus, sessionsByStatus, ratingDistribution] =
      await Promise.all([
        User.aggregate([
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Skill.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        SkillRequest.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Session.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Review.aggregate([
          { $group: { _id: '$rating', count: { $sum: 1 } } },
          { $sort: { _id: -1 } },
        ]),
      ]);

    res.status(200).json({
      usersByMonth,
      skillsByCategory,
      requestsByStatus,
      sessionsByStatus,
      ratingDistribution,
    });
  } catch (error) {
    console.error('Admin analytics error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
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
};