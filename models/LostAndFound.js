const mongoose = require('mongoose');

const lostAndFoundSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Please specify if item is lost or found']
  },
  itemName: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true,
    maxlength: [100, 'Item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    enum: ['Electronics', 'Documents', 'Accessories', 'Books', 'Other'],
    default: 'Other'
  },
  location: {
    type: String,
    trim: true
  },
  date: {
    type: Date
  },
  contactInfo: {
    type: String,
    required: [true, 'Please add contact information']
  },
  imageUrl: {
    type: String
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'claimed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for better query performance
lostAndFoundSchema.index({ type: 1, status: 1, category: 1 });
lostAndFoundSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LostAndFound', lostAndFoundSchema);

