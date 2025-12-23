const Notice = require('../models/Notice');
const Event = require('../models/Event');
const LostAndFound = require('../models/LostAndFound');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';

    // Common stats
    const totalNotices = await Notice.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });
    
    let stats = {
      totalNotices,
      upcomingEvents
    };

    if (isAdmin) {
      // Admin-specific stats
      const pendingLostFound = await LostAndFound.countDocuments({ status: 'pending' });
      const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalLostFound = await LostAndFound.countDocuments();
      const totalFeedback = await Feedback.countDocuments();
      const totalEvents = await Event.countDocuments();

      stats = {
        ...stats,
        pendingLostFound,
        pendingFeedback,
        totalStudents,
        totalLostFound,
        totalFeedback,
        totalEvents
      };
    } else {
      // Student-specific stats
      const myLostFound = await LostAndFound.countDocuments({ postedBy: req.user.id });
      
      stats = {
        ...stats,
        myLostFound
      };
    }

    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent activity (admin only)
// @route   GET /api/stats/activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res, next) => {
  try {
    const recentNotices = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt');
    
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title date createdAt');
    
    const recentLostFound = await LostAndFound.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'name')
      .select('itemName type status createdAt');
    
    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject category status isAnonymous createdAt');

    res.status(200).json({
      success: true,
      message: 'Recent activity retrieved successfully',
      data: {
        notices: recentNotices,
        events: recentEvents,
        lostFound: recentLostFound,
        feedback: recentFeedback
      }
    });
  } catch (err) {
    next(err);
  }
};

