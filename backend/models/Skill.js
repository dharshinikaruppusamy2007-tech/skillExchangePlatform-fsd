const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [100, 'Skill name must be 100 characters or fewer'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category must be 100 characters or fewer'],
    },
    type: {
      type: String,
      enum: ['teach', 'learn'],
      required: [true, 'Skill type is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be 1000 characters or fewer'],
      default: '',
    },
    proficiency: {
      type: String,
      enum: ['', 'Beginner', 'Intermediate', 'Advanced'],
      default: '',
    },
  },
  {
    // Adds createdAt and updatedAt automatically
    timestamps: true,
  }
);

skillSchema.index({ skillName: 'text', description: 'text' });

module.exports = mongoose.model('Skill', skillSchema);