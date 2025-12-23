const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getEvents,
  getUpcomingEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const eventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot be more than 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Event time is required'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),
  body('category')
    .optional()
    .isIn(['Cultural', 'Technical', 'Sports', 'Workshop', 'Seminar'])
    .withMessage('Invalid category')
];

router.get('/upcoming', getUpcomingEvents);

router
  .route('/')
  .get(getEvents)
  .post(protect, authorize('admin'), eventValidation, createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize('admin'), eventValidation, updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

module.exports = router;

