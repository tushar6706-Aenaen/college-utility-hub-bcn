const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getPosts,
  getAllPosts,
  getMyPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  approvePost,
  rejectPost,
  claimPost
} = require('../controllers/lostFoundController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const postValidation = [
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['lost', 'found'])
    .withMessage('Type must be either lost or found'),
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ max: 100 })
    .withMessage('Item name cannot be more than 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('contactInfo')
    .trim()
    .notEmpty()
    .withMessage('Contact information is required'),
  body('category')
    .optional()
    .isIn(['Electronics', 'Documents', 'Accessories', 'Books', 'Other'])
    .withMessage('Invalid category')
];

// Public routes
router.get('/', getPosts);

// Protected routes
router.get('/my-posts', protect, getMyPosts);
router.get('/all', protect, authorize('admin'), getAllPosts);

router
  .route('/')
  .post(protect, postValidation, createPost);

router
  .route('/:id')
  .get(getPost)
  .put(protect, postValidation, updatePost)
  .delete(protect, deletePost);

// Admin routes for moderation
router.patch('/:id/approve', protect, authorize('admin'), approvePost);
router.patch('/:id/reject', protect, authorize('admin'), rejectPost);
router.patch('/:id/claim', protect, claimPost);

module.exports = router;

