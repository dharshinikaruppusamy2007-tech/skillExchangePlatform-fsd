const User = require('../models/User');

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const MAX_SKILLS = 20;

// Serializes a user document into a safe public profile shape.
// The password is never included here, and the User schema also stores it
// with `select: false`, so it is excluded from queries by default.
const toSafeProfile = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  profileImage: user.profileImage,
  location: user.location,
  skillsToTeach: user.skillsToTeach,
  skillsToLearn: user.skillsToLearn,
  experienceLevel: user.experienceLevel,
  role: user.role,
  createdAt: user.createdAt,
});

// Normalizes a skill array: trims, drops empties, dedupes case-insensitively,
// and caps the length. Assumes the input is already an array.
const cleanSkillArray = (value) => {
  const seen = new Set();
  const result = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const skill = item.trim();
    const key = skill.toLowerCase();
    if (!skill || seen.has(key)) continue;
    seen.add(key);
    result.push(skill);
    if (result.length >= MAX_SKILLS) break;
  }
  return result;
};

// @desc    Get the currently logged-in user's profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(toSafeProfile(user));
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Update the currently logged-in user's profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      profileImage,
      location,
      skillsToTeach,
      skillsToLearn,
      experienceLevel,
    } = req.body;

    // Whitelist of editable fields. password, email, and role are never
    // accepted on this route.
    const update = {};

    if (name !== undefined) {
      const value = typeof name === 'string' ? name.trim() : name;
      if (!value) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      if (value.length > 100) {
        return res.status(400).json({ message: 'Name must be 100 characters or fewer' });
      }
      update.name = value;
    }

    if (bio !== undefined) {
      const value = typeof bio === 'string' ? bio.trim() : bio;
      if (value.length > 1000) {
        return res.status(400).json({ message: 'Bio must be 1000 characters or fewer' });
      }
      update.bio = value;
    }

    if (profileImage !== undefined) {
      const value = typeof profileImage === 'string' ? profileImage.trim() : profileImage;
      if (value.length > 500) {
        return res.status(400).json({ message: 'Profile image URL is too long' });
      }
      update.profileImage = value;
    }

    if (location !== undefined) {
      update.location = typeof location === 'string' ? location.trim() : location;
    }

    if (experienceLevel !== undefined) {
      if (!EXPERIENCE_LEVELS.includes(experienceLevel)) {
        return res
          .status(400)
          .json({ message: 'Experience level must be Beginner, Intermediate, or Advanced' });
      }
      update.experienceLevel = experienceLevel;
    }

    if (skillsToTeach !== undefined) {
      if (!Array.isArray(skillsToTeach)) {
        return res.status(400).json({ message: 'Skills to teach must be a list of skills' });
      }
      update.skillsToTeach = cleanSkillArray(skillsToTeach);
    }

    if (skillsToLearn !== undefined) {
      if (!Array.isArray(skillsToLearn)) {
        return res.status(400).json({ message: 'Skills to learn must be a list of skills' });
      }
      update.skillsToLearn = cleanSkillArray(skillsToLearn);
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(toSafeProfile(user));
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { getProfile, updateProfile };