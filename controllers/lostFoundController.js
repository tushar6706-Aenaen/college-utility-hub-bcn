const { validationResult } = require('express-validator');
const LostAndFound = require('../models/LostAndFound');

// @desc    Get all approved lost & found posts
// @route   GET /api/lostfound
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const { type, category, search, page = 1, limit = 10 } = req.query;
    
    // Build query - only approved posts for public view
    const query = { status: 'approved' };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await LostAndFound.find(query)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await LostAndFound.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: {
        posts,
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

// @desc    Get all posts (admin view)
// @route   GET /api/lostfound/all
// @access  Private/Admin
exports.getAllPosts = async (req, res, next) => {
  try {
    const { type, category, status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await LostAndFound.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await LostAndFound.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'All posts retrieved successfully',
      data: {
        posts,
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

// @desc    Get user's posts
// @route   GET /api/lostfound/my-posts
// @access  Private
exports.getMyPosts = async (req, res, next) => {
  try {
    const posts = await LostAndFound.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Your posts retrieved successfully',
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post
// @route   GET /api/lostfound/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await LostAndFound.findById(req.params.id)
      .populate('postedBy', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create post
// @route   POST /api/lostfound
// @access  Private
exports.createPost = async (req, res, next) => {
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
    req.body.status = 'pending'; // All posts start as pending

    const post = await LostAndFound.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Post created successfully. It will be visible after admin approval.',
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post
// @route   PUT /api/lostfound/:id
// @access  Private/Owner
exports.updatePost = async (req, res, next) => {
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

    let post = await LostAndFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Make sure user is post owner
    if (post.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
        data: null
      });
    }

    // Reset status to pending if student updates
    if (req.user.role !== 'admin') {
      req.body.status = 'pending';
    }

    post = await LostAndFound.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post
// @route   DELETE /api/lostfound/:id
// @access  Private/Owner/Admin
exports.deletePost = async (req, res, next) => {
  try {
    const post = await LostAndFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Make sure user is post owner or admin
    if (post.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
        data: null
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve post
// @route   PATCH /api/lostfound/:id/approve
// @access  Private/Admin
exports.approvePost = async (req, res, next) => {
  try {
    let post = await LostAndFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    post = await LostAndFound.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post approved successfully',
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject post
// @route   PATCH /api/lostfound/:id/reject
// @access  Private/Admin
exports.rejectPost = async (req, res, next) => {
  try {
    let post = await LostAndFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    post = await LostAndFound.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post rejected',
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark post as claimed
// @route   PATCH /api/lostfound/:id/claim
// @access  Private/Owner/Admin
exports.claimPost = async (req, res, next) => {
  try {
    let post = await LostAndFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Make sure user is post owner or admin
    if (post.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this post as claimed',
        data: null
      });
    }

    post = await LostAndFound.findByIdAndUpdate(
      req.params.id,
      { status: 'claimed' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post marked as claimed',
      data: post
    });
  } catch (err) {
    next(err);
  }
};

