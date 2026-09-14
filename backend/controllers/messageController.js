const mongoose = require('mongoose');
const SkillRequest = require('../models/SkillRequest');
const Message = require('../models/Message');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateRequest = (query) =>
  query
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .populate('skill', 'skillName category proficiency');

// @desc    List the accepted exchanges (conversations) for the logged-in user
// @route   GET /api/messages
// @access  Private
const getConversations = async (req, res) => {
  try {
    const me = req.user.id;

    const accepted = await populateRequest(
      SkillRequest.find({
        $or: [{ sender: me, status: 'accepted' }, { receiver: me, status: 'accepted' }],
      }).sort({ updatedAt: -1 })
    );

    const seen = new Set();
    const conversations = [];

    for (const request of accepted) {
      const senderId = String(request.sender?._id || request.sender);
      const isSender = senderId === String(me);
      const other = isSender ? request.receiver : request.sender;
      const otherId = String(other?._id || other);
      if (seen.has(otherId)) continue;
      seen.add(otherId);

      const pairFilter = {
        $or: [{ sender: me, receiver: otherId }, { sender: otherId, receiver: me }],
      };

      const last = await Message.findOne(pairFilter).sort({ createdAt: -1 });

      conversations.push({
        requestId: request._id,
        otherUserId: otherId,
        name: other?.name || 'Unknown user',
        profileImage: other?.profileImage || '',
        skillName: request.skill?.skillName || '',
        category: request.skill?.category || '',
        lastMessage: last ? last.message : '',
        lastMessageAt: last ? last.createdAt : request.updatedAt,
        totalMessages: await Message.countDocuments(pairFilter),
      });
    }

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get the full chat thread with another user (accepted exchange only)
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const me = req.user.id;
    const otherId = req.params.userId;

    if (!isValidObjectId(otherId)) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    const request = await populateRequest(
      SkillRequest.findOne({
        status: 'accepted',
        $or: [{ sender: me, receiver: otherId }, { sender: otherId, receiver: me }],
      }).sort({ updatedAt: -1 })
    );

    if (!request) {
      return res.status(403).json({
        message: 'You can only chat after your exchange request has been accepted',
      });
    }

    const senderId = String(request.sender?._id || request.sender);
    const isSender = senderId === String(me);
    const other = isSender ? request.receiver : request.sender;

    const messages = await Message.find({
      $or: [{ sender: me, receiver: otherId }, { sender: otherId, receiver: me }],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage');

    res.status(200).json({
      user: {
        _id: otherId,
        name: other?.name || 'Unknown user',
        profileImage: other?.profileImage || '',
      },
      request: {
        _id: request._id,
        skillName: request.skill?.skillName || '',
        category: request.skill?.category || '',
        status: request.status,
      },
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Send a message inside an accepted exchange
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const me = req.user.id;
    const { receiverId, requestId, message } = req.body;

    if (!isValidObjectId(receiverId) || !isValidObjectId(requestId)) {
      return res.status(400).json({ message: 'Receiver and exchange request are required' });
    }

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    if (message.trim().length > 2000) {
      return res.status(400).json({ message: 'Message must be 2000 characters or fewer' });
    }

    const request = await SkillRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Exchange request not found' });
    }
    if (request.status !== 'accepted') {
      return res.status(403).json({ message: 'You can only message after the request has been accepted' });
    }

    // Only the two users in the accepted exchange may message each other
    const involvesMe = request.sender.equals(me) || request.receiver.equals(me);
    const involvesReceiver = String(request.sender) === String(receiverId) ||
      String(request.receiver) === String(receiverId);

    if (!involvesMe || !involvesReceiver) {
      return res.status(403).json({ message: 'You cannot send messages for this exchange request' });
    }

    const created = await Message.create({
      sender: me,
      receiver: receiverId,
      request: requestId,
      message: message.trim(),
    });

    const populated = await Message.findById(created._id)
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { getConversations, getMessages, sendMessage };