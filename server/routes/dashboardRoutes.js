const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const {
  getStats,
  getRecentActivity,
  getUpcomingDeadlines,
  getRevenueChart,
  getProjectProgress,
  getTaskSummary,
  getClientMetrics
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(auth);

// Get dashboard statistics
router.get('/stats', getStats);

// Get recent activity
router.get('/recent-activity', getRecentActivity);

// Get upcoming deadlines
router.get('/upcoming-deadlines', getUpcomingDeadlines);

// Get revenue chart data
router.get('/revenue-chart', getRevenueChart);

// Get project progress
router.get('/project-progress', getProjectProgress);

// Get task summary
router.get('/task-summary', getTaskSummary);

// Get client metrics
router.get('/client-metrics', getClientMetrics);

module.exports = router;
