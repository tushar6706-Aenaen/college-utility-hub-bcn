const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Admin management routes
const adminValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// GET /api/auth/admins - Get all admins (admin only)
router.get('/admins', protect, authorize('admin'), async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json({
      success: true,
      message: 'Admins retrieved successfully',
      data: admins
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/create-admin - Create new admin (admin only)
router.post('/create-admin', protect, authorize('admin'), adminValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        data: null
      });
    }

    const { name, email, password, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
        data: null
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      department: department || 'Administration',
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department
      }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/admins/:id - Delete admin (admin only, cannot delete self)
router.delete('/admins/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
        data: null
      });
    }

    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        data: null
      });
    }

    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin',
        data: null
      });
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
      data: null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

