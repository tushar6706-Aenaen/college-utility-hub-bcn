const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getAllFeedback,
  submitFeedback,
  resolveFeedback,
  getFeedbackStats
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const feedbackValidation = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot be more than 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required'),
  body('category')
    .optional()
    .isIn(['Facilities', 'Services', 'Academic', 'Infrastructure', 'Other'])
    .withMessage('Invalid category')
];

// Admin routes
router.get('/', protect, authorize('admin'), getAllFeedback);
router.get('/stats', protect, authorize('admin'), getFeedbackStats);
router.patch('/:id/resolve', protect, authorize('admin'), resolveFeedback);

// Student routes
router.post('/', protect, feedbackValidation, submitFeedback);

module.exports = router;

