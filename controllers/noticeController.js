const { validationResult } = require('express-validator');
const Notice = require('../models/Notice');

// @desc    Get all active notices
// @route   GET /api/notices
// @access  Public
exports.getNotices = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notices = await Notice.find(query)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notice.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Notices retrieved successfully',
      data: {
        notices,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: total
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Public
exports.getNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('postedBy', 'name');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notice retrieved successfully',
      data: notice
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create notice
// @route   POST /api/notices
// @access  Private/Admin
exports.createNotice = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        data: null
      });
    }

    // Add user to req.body
    req.body.postedBy = req.user.id;

    const notice = await Notice.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Admin
exports.updateNotice = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        data: null
      });
    }

    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
        data: null
      });
    }

    notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
        data: null
      });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

