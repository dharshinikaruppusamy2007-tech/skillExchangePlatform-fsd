const mongoose = require('mongoose');
const Skill = require('../models/Skill');

const TYPES = ['teach', 'learn'];
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Only ever expose the safe owner fields (never the password hash)
const OWNER_SAFE_FIELDS = 'name email profileImage location';

// Escapes user input so it can be used safely inside a RegExp
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Validates and cleans skill data. Returns { clean, errors }.
const validateSkillData = (body) => {
  const { skillName, category, type, description, proficiency } = body || {};
  const errors = [];

  const skillNameValue = typeof skillName === 'string' ? skillName.trim() : '';
  if (!skillNameValue) {
    errors.push('Skill name is required');
  } else if (skillNameValue.length > 100) {
    errors.push('Skill name must be 100 characters or fewer');
  }

  const categoryValue = typeof category === 'string' ? category.trim() : '';
  if (!categoryValue) {
    errors.push('Category is required');
  } else if (categoryValue.length > 100) {
    errors.push('Category must be 100 characters or fewer');
  }

  if (!type) {
    errors.push('Skill type is required');
  } else if (!TYPES.includes(type)) {
    errors.push('Skill type must be "teach" or "learn"');
  }

  const descriptionValue = typeof description === 'string' ? description.trim() : '';
  if (description !== undefined && typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (descriptionValue.length > 1000) {
    errors.push('Description must be 1000 characters or fewer');
  }

  if (proficiency !== undefined && proficiency !== '') {
    if (!PROFICIENCY_LEVELS.includes(proficiency)) {
      errors.push('Proficiency must be Beginner, Intermediate, or Advanced');
    }
  }

  return {
    clean: {
      skillName: skillNameValue,
      category: categoryValue,
      type,
      description: descriptionValue,
      proficiency: proficiency || '',
    },
    errors,
  };
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Builds the allowed comparison filter for search + filters.
const buildFilter = (query) => {
  const { search, category, level, type } = query;
  const filter = {};

  if (search && search.trim()) {
    const pattern = new RegExp(escapeRegExp(search.trim()), 'i');
    filter.$or = [{ skillName: pattern }, { description: pattern }];
  }

  if (category && category.trim()) {
    filter.category = { $regex: new RegExp(escapeRegExp(category.trim()), 'i') };
  }

  if (level && level.trim()) {
    if (!PROFICIENCY_LEVELS.includes(level)) {
      return { error: 'Level must be Beginner, Intermediate, or Advanced' };
    }
    filter.proficiency = level;
  }

  if (type && type.trim()) {
    if (!TYPES.includes(type)) {
      return { error: 'Skill type must be "teach" or "learn"' };
    }
    filter.type = type;
  }

  return { filter };
};

// @desc    Get available skills with search, category and level filtering
// @route   GET /api/skills
// @query   search, category, level, type, owner=me|all
// @access  Private (used by logged-in users, including for "my skills")
const getSkills = async (req, res) => {
  try {
    const { filter, error } = buildFilter(req.query);
    if (error) {
      return res.status(400).json({ message: error });
    }

    // ?owner=me returns only the authenticated user's own skills
    if (req.query.owner === 'me') {
      filter.userId = req.user.id;
    }

    const skills = await Skill.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', OWNER_SAFE_FIELDS);

    res.status(200).json(skills);
  } catch (error) {
    console.error('Get skills error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get a single skill along with its owner
// @route   GET /api/skills/:id
// @access  Private
const getSkillById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const skill = await Skill.findById(req.params.id).populate(
      'userId',
      OWNER_SAFE_FIELDS
    );
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.status(200).json(skill);
  } catch (error) {
    console.error('Get skill error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Add a new skill for the logged-in user
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res) => {
  try {
    const { clean, errors } = validateSkillData(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    // Owner always comes from the verified JWT, never from the request body
    const skill = await Skill.create({
      userId: req.user.id,
      ...clean,
    });

    res.status(201).json(skill);
  } catch (error) {
    console.error('Create skill error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Update one of the logged-in user's own skills
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const skill = await Skill.findOne({ _id: req.params.id });

    // A skill that does not exist is handled as a 404
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Only the skill owner may update it
    if (skill.userId.toString() !== String(req.user.id)) {
      return res.status(403).json({
        message: 'Not authorized. You can only update your own skills.',
      });
    }

    const { clean, errors } = validateSkillData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    skill.skillName = clean.skillName;
    skill.category = clean.category;
    skill.type = clean.type;
    skill.description = clean.description;
    skill.proficiency = clean.proficiency;

    await skill.save();

    res.status(200).json(skill);
  } catch (error) {
    console.error('Update skill error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Delete one of the logged-in user's own skills
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const skill = await Skill.findOne({ _id: req.params.id });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Only the skill owner may delete it
    if (skill.userId.toString() !== String(req.user.id)) {
      return res.status(403).json({
        message: 'Not authorized. You can only delete your own skills.',
      });
    }

    await skill.deleteOne();

    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { getSkills, getSkillById, createSkill, updateSkill, deleteSkill };