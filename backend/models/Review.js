const mongoose = require('mongoose');

// A rating + optional comment left by a participant of a COMPLETED
// session. Reviewer/reviewee are derived server-side from the session.
const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
      index: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee is required'],
      index: true,
    },
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillRequest',
      required: [true, 'Exchange request is required'],
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: [true, 'Session is required'],
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment must be 1000 characters or fewer'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One review per reviewer per session
reviewSchema.index({ reviewer: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);