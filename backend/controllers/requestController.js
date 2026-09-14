const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const SkillRequest = require('../models/SkillRequest');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateRequest = (query) =>
  query
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .populate('skill', 'skillName category proficiency');

// @desc    Create a skill exchange request from the logged-in user
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  try {
    const { receiverId, skillId, message } = req.body;

    if (!isValidObjectId(receiverId) || !isValidObjectId(skillId)) {
      return res.status(400).json({ message: 'Receiver and skill are required' });
    }

    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    if (trimmedMessage.length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer' });
    }

    if (String(receiverId) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot send a request to yourself' });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    if (String(skill.userId) !== String(receiverId)) {
      return res.status(400).json({ message: 'That skill does not belong to the selected user' });
    }
    if (skill.type !== 'teach') {
      return res.status(400).json({ message: 'You can only request a skill the user offers to teach' });
    }

    // Prevent duplicate active requests for the same sender, receiver and skill
    const existing = await SkillRequest.findOne({
      sender: req.user.id,
      receiver: receiverId,
      skill: skillId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'You already sent a request for this skill' });
    }

    const request = await SkillRequest.create({
      sender: req.user.id,
      receiver: receiverId,
      skill: skillId,
      status: 'pending',
      message: trimmedMessage,
    });

    const populated = await populateRequest(SkillRequest.findById(request._id));
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create request error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get requests the user sent and the ones received
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    const sent = await populateRequest(
      SkillRequest.find({ sender: req.user.id }).sort({ createdAt: -1 })
    );
    const received = await populateRequest(
      SkillRequest.find({ receiver: req.user.id }).sort({ createdAt: -1 })
    );

    res.status(200).json({ sent, received });
  } catch (error) {
    console.error('Get requests error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Accept or reject a request (receiver only)
// @route   PUT /api/requests/:id
// @access  Private
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "accepted" or "rejected"' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = await SkillRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the receiver may accept/reject
    if (!request.receiver.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only the receiver can accept or reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only a pending request can be updated' });
    }

    request.status = status;
    await request.save();

    const populated = await populateRequest(SkillRequest.findById(request._id));
    res.status(200).json(populated);
  } catch (error) {
    console.error('Update request error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { createRequest, getRequests, updateRequestStatus };