const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require("../controllers/notificationController");
const { auth } = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(auth);

// Get user notifications
router.get("/", getUserNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notifications as read
router.post("/mark-as-read", markAsRead);

// Mark all notifications as read
router.post("/mark-all-as-read", markAllAsRead);

module.exports = router;
