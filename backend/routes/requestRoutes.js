const express = require('express');
const router = express.Router();

const {
  createRequest,
  getRequests,
  updateRequestStatus,
  cancelRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRequests);
router.post('/', protect, createRequest);
router.put('/:id', protect, updateRequestStatus);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;