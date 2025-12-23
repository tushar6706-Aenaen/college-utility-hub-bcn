const express = require('express');
const router = express.Router();
const { getStats, getRecentActivity } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getStats);
router.get('/activity', protect, authorize('admin'), getRecentActivity);

module.exports = router;

