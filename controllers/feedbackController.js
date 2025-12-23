const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

// @desc    Get all feedback (admin only)
// @route   GET /api/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const feedback = await Feedback.find(query)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: {
        feedback,
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

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res, next) => {
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

    const { subject, message, category, isAnonymous } = req.body;

    const feedbackData = {
      subject,
      message,
      category,
      isAnonymous: isAnonymous || false,
      submittedBy: isAnonymous ? null : req.user.id
    };

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark feedback as resolved
// @route   PATCH /api/feedback/:id/resolve
// @access  Private/Admin
exports.resolveFeedback = async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
        data: null
      });
    }

    feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Feedback marked as resolved',
      data: feedback
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private/Admin
exports.getFeedbackStats = async (req, res, next) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Feedback statistics retrieved successfully',
      data: {
        byStatus: stats,
        byCategory: categoryStats
      }
    });
  } catch (err) {
    next(err);
  }
};

