const express = require('express');
const router = express.Router();

const {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { discoverSkills } = require('../controllers/discoveryController');
const { protect } = require('../middleware/authMiddleware');

// Get all available skills (with search/filters) and list own skills
router.get('/', protect, getSkills);

// Skill discovery & matching (kept as a separate module 4 endpoint)
router.get('/discover', protect, discoverSkills);

// Get a single skill
router.get('/:id', protect, getSkillById);

// Create a new skill - owner comes from the verified JWT
router.post('/', protect, createSkill);

router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;