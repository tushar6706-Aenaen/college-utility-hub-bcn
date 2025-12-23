const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  category: {
    type: String,
    enum: ['Facilities', 'Services', 'Academic', 'Infrastructure', 'Other'],
    default: 'Other'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for better query performance
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);

