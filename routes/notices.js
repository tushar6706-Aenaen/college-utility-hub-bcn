const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const noticeValidation = [
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
  body('category')
    .optional()
    .isIn(['Academic', 'Events', 'General', 'Urgent', 'Exam'])
    .withMessage('Invalid category')
];

router
  .route('/')
  .get(getNotices)
  .post(protect, authorize('admin'), noticeValidation, createNotice);

router
  .route('/:id')
  .get(getNotice)
  .put(protect, authorize('admin'), noticeValidation, updateNotice)
  .delete(protect, authorize('admin'), deleteNotice);

module.exports = router;

