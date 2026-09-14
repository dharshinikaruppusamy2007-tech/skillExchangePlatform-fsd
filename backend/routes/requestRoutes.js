const express = require('express');
const router = express.Router();

const {
  createRequest,
  getRequests,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRequests);
router.post('/', protect, createRequest);
router.put('/:id', protect, updateRequestStatus);

module.exports = router;