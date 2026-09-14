const express = require('express');
const router = express.Router();

const { getProfile, updateProfile, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/:id', protect, getPublicProfile);

module.exports = router;