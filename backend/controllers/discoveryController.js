const Skill = require('../models/Skill');

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TYPES = ['teach', 'learn'];

// Escapes user input so it can be used safely inside a RegExp
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Discover other users by their skills
// @route   GET /api/skills/discover
// @query   skill, category, proficiency, type
// @access  Private
const discoverSkills = async (req, res) => {
  try {
    const { skill, category, proficiency, type } = req.query;

    if (proficiency && !PROFICIENCY_LEVELS.includes(proficiency)) {
      return res.status(400).json({
        message: 'Proficiency must be Beginner, Intermediate, or Advanced',
      });
    }
    if (type && !TYPES.includes(type)) {
      return res.status(400).json({ message: 'Type must be "teach" or "learn"' });
    }

    // Only ever show OTHER users: the logged-in user is always excluded
    const filter = { userId: { $ne: req.user.id } };

    if (skill && skill.trim()) {
      filter.skillName = { $regex: escapeRegExp(skill.trim()), $options: 'i' };
    }
    if (category && category.trim()) {
      filter.category = { $regex: escapeRegExp(category.trim()), $options: 'i' };
    }
    if (proficiency) {
      filter.proficiency = proficiency;
    }
    if (type) {
      filter.type = type;
    }

    const skills = await Skill.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name location profileImage');

    // The current user's own skills (from real MongoDB Skill documents) are
    // used to compute the two matching directions.
    const mySkills = await Skill.find({ userId: req.user.id }).select('skillName type');
    const myTeach = new Set(
      mySkills.filter((s) => s.type === 'teach').map((s) => s.skillName.toLowerCase())
    );
    const myLearn = new Set(
      mySkills.filter((s) => s.type === 'learn').map((s) => s.skillName.toLowerCase())
    );

    const teaches = [];
    const learns = [];

    for (const item of skills) {
      if (!item.userId) continue;

      const entry = {
        userId: item.userId._id,
        name: item.userId.name,
        location: item.userId.location,
        profileImage: item.userId.profileImage,
        skill: {
          _id: item._id,
          skillName: item.skillName,
          category: item.category,
          type: item.type,
          proficiency: item.proficiency,
          description: item.description,
        },
        isMatch: false,
        matchedSkill: null,
      };

      const key = item.skillName.toLowerCase();
      if (item.type === 'teach') {
        // "I want to learn it, they can teach it"
        if (myLearn.has(key)) {
          entry.isMatch = true;
          entry.matchedSkill = item.skillName;
        }
        teaches.push(entry);
      } else {
        // "I can teach it, they want to learn it"
        if (myTeach.has(key)) {
          entry.isMatch = true;
          entry.matchedSkill = item.skillName;
        }
        learns.push(entry);
      }
    }

    res.status(200).json({ teaches, learns });
  } catch (error) {
    console.error('Discover skills error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { discoverSkills };