const express = require('express');
const router = express.Router();

const {
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConversations);
router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);

module.exports = router;