const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const {
  getAnalytics,
  getRevenueData,
  getClientMetrics,
  getProjectMetrics,
  getTimeMetrics,
  exportReport
} = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(auth);

// Get comprehensive analytics data
router.get('/', getAnalytics);

// Get detailed revenue analytics
router.get('/revenue', getRevenueData);

// Get client insights and metrics
router.get('/clients', getClientMetrics);

// Get project and task productivity metrics
router.get('/projects', getProjectMetrics);

// Get time-based metrics and trends
router.get('/time', getTimeMetrics);

// Export analytics report
router.get('/export', exportReport);

module.exports = router;
