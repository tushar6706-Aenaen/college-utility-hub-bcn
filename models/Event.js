const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  date: {
    type: Date,
    required: [true, 'Please add an event date']
  },
  time: {
    type: String,
    required: [true, 'Please add an event time']
  },
  venue: {
    type: String,
    required: [true, 'Please add a venue'],
    trim: true
  },
  organizer: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Cultural', 'Technical', 'Sports', 'Workshop', 'Seminar'],
    default: 'Cultural'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ date: 1, category: 1 });
eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Event', eventSchema);

