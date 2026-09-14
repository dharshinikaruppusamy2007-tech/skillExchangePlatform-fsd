const mongoose = require('mongoose');

// A scheduled skill exchange session. Always created from an ACCEPTED
// exchange request; mentor/learner are derived from the request, never
// taken from the frontend.
const sessionSchema = new mongoose.Schema(
  {
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillRequest',
      required: [true, 'Exchange request is required'],
      index: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor is required'],
      index: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner is required'],
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill is required'],
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [480, 'Duration must be 480 minutes or fewer'],
    },
    meetingMode: {
      type: String,
      enum: ['Online', 'Offline'],
      required: [true, 'Meeting mode is required'],
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or fewer'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled'],
      default: 'Upcoming',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', sessionSchema);