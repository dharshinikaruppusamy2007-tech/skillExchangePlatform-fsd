const mongoose = require('mongoose');
const Session = require('../models/Session');
const SkillRequest = require('../models/SkillRequest');
const Skill = require('../models/Skill');

const VALID_MODES = ['Online', 'Offline'];
const VALID_STATUSES = ['Upcoming', 'Completed', 'Cancelled'];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateSession = (query) =>
  query
    .populate('exchangeRequest', 'sender receiver status')
    .populate('mentor', 'name profileImage email')
    .populate('learner', 'name profileImage email')
    .populate('skill', 'skillName category proficiency');

// Parses and validates the scheduling fields shared by create/update.
// Returns { clean, errors }.
const validateSessionData = (body, options = {}) => {
  const {
    scheduledDate,
    startTime,
    duration,
    meetingMode,
    meetingLink,
    notes,
  } = body || {};
  const errors = [];
  const clean = {};

  if (scheduledDate !== undefined) {
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      errors.push('Please provide a valid date');
    } else if (options.requireFuture && date.getTime() < Date.now() - 86400000) {
      errors.push('Scheduled date cannot be in the past');
    } else {
      clean.scheduledDate = date;
    }
  }

  if (startTime !== undefined) {
    const value = typeof startTime === 'string' ? startTime.trim() : '';
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.test(value);
    if (!match) {
      errors.push('Please provide a valid start time (e.g. 10:00)');
    } else {
      clean.startTime = value;
    }
  }

  if (duration !== undefined) {
    const value = Number(duration);
    if (!Number.isInteger(value) || value < 1 || value > 480) {
      errors.push('Duration must be between 1 and 480 minutes');
    } else {
      clean.duration = value;
    }
  }

  if (meetingMode !== undefined) {
    if (!VALID_MODES.includes(meetingMode)) {
      errors.push('Meeting mode must be Online or Offline');
    } else {
      clean.meetingMode = meetingMode;
    }
  }

  if (meetingLink !== undefined) {
    const value = typeof meetingLink === 'string' ? meetingLink.trim() : '';
    if (value && !/^https?:\/\//i.test(value)) {
      errors.push('Meeting link must start with http:// or https://');
    } else {
      clean.meetingLink = value;
    }
  }

  if (notes !== undefined) {
    const value = typeof notes === 'string' ? notes.trim() : '';
    if (value.length > 1000) {
      errors.push('Notes must be 1000 characters or fewer');
    } else {
      clean.notes = value;
    }
  }

  return { clean, errors };
};

// @desc    Create a session from an accepted exchange request
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res) => {
  try {
    const { exchangeRequest } = req.body;

    if (!isValidObjectId(exchangeRequest)) {
      return res.status(400).json({ message: 'Exchange request is invalid' });
    }

    const request = await SkillRequest.findById(exchangeRequest);
    if (!request) {
      return res.status(404).json({ message: 'Exchange request not found' });
    }

    // Only the two participants may schedule
    const isSender = request.sender.equals(req.user.id);
    const isReceiver = request.receiver.equals(req.user.id);
    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: 'You cannot schedule a session for this exchange' });
    }

    if (request.status !== 'accepted') {
      return res
        .status(400)
        .json({ message: 'You can only schedule a session for an accepted exchange request' });
    }

    // Prevent an active duplicate session for the same request
    const existing = await Session.findOne({
      exchangeRequest: request._id,
      status: 'Upcoming',
    });
    if (existing) {
      return res.status(400).json({ message: 'This exchange already has a scheduled session' });
    }

    const { clean, errors } = validateSessionData(req.body, { requireFuture: true });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    if (!clean.scheduledDate || !clean.startTime || !clean.duration || !clean.meetingMode) {
      return res
        .status(400)
        .json({ message: 'Date, start time, duration and meeting mode are required' });
    }

    // The owner of the requested skill mentors the learner
    const skill = await Skill.findById(request.skill);
    const mentor = request.receiver;
    const learner = request.sender;

    const session = await Session.create({
      exchangeRequest: request._id,
      mentor,
      learner,
      skill: request.skill,
      status: 'Upcoming',
      meetingLink: skill && clean.meetingMode === 'Online' ? clean.meetingLink || '' : '',
      ...clean,
    });

    const populated = await populateSession(Session.findById(session._id));
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create session error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get sessions the logged-in user participates in
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const sessions = await populateSession(
      Session.find({
        $or: [{ mentor: req.user.id }, { learner: req.user.id }],
      }).sort({ scheduledDate: -1, createdAt: -1 })
    );

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get upcoming sessions for the logged-in user
// @route   GET /api/sessions/upcoming
// @access  Private
const getUpcomingSessions = async (req, res) => {
  try {
    const sessions = await populateSession(
      Session.find({
        $or: [{ mentor: req.user.id }, { learner: req.user.id }],
        status: 'Upcoming',
      }).sort({ scheduledDate: 1, startTime: 1 })
    );

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Get upcoming sessions error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get past (completed/cancelled) sessions for the logged-in user
// @route   GET /api/sessions/past
// @access  Private
const getPastSessions = async (req, res) => {
  try {
    const sessions = await populateSession(
      Session.find({
        $or: [{ mentor: req.user.id }, { learner: req.user.id }],
        status: { $in: ['Completed', 'Cancelled'] },
      }).sort({ scheduledDate: -1, updatedAt: -1 })
    );

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Get past sessions error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get a single session (participants only)
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = await populateSession(Session.findById(req.params.id));
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isParticipant =
      session.mentor._id.equals(req.user.id) ||
      session.learner._id.equals(req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Only session participants can view this session' });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error('Get session error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Update an upcoming session (participants only)
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isParticipant =
      session.mentor.equals(req.user.id) || session.learner.equals(req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Only session participants can edit this session' });
    }

    if (session.status !== 'Upcoming') {
      return res.status(400).json({ message: 'Only upcoming sessions can be edited' });
    }

    const { clean, errors } = validateSessionData(req.body, { requireFuture: true });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    Object.assign(session, clean);
    await session.save();

    const populated = await populateSession(Session.findById(session._id));
    res.status(200).json(populated);
  } catch (error) {
    console.error('Update session error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Mark a session as completed (participants only)
// @route   PUT /api/sessions/:id/complete
// @access  Private
const completeSession = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isParticipant =
      session.mentor.equals(req.user.id) || session.learner.equals(req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Only session participants can complete this session' });
    }

    if (session.status !== 'Upcoming') {
      return res.status(400).json({ message: 'Only upcoming sessions can be completed' });
    }

    session.status = 'Completed';
    await session.save();

    const populated = await populateSession(Session.findById(session._id));
    res.status(200).json(populated);
  } catch (error) {
    console.error('Complete session error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Cancel a session (participants only)
// @route   PUT /api/sessions/:id/cancel
// @access  Private
const cancelSession = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isParticipant =
      session.mentor.equals(req.user.id) || session.learner.equals(req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Only session participants can cancel this session' });
    }

    if (session.status !== 'Upcoming') {
      return res.status(400).json({ message: 'Only upcoming sessions can be cancelled' });
    }

    session.status = 'Cancelled';
    await session.save();

    const populated = await populateSession(Session.findById(session._id));
    res.status(200).json(populated);
  } catch (error) {
    console.error('Cancel session error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  createSession,
  getSessions,
  getUpcomingSessions,
  getPastSessions,
  getSessionById,
  updateSession,
  completeSession,
  cancelSession,
};