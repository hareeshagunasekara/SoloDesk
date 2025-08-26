const Notification = require("../models/Notification");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { unreadOnly, type, limit } = req.query;
    const userId = req.user._id;

    const options = {
      unreadOnly: unreadOnly === "true",
      type,
      limit: limit ? parseInt(limit) : 50,
    };

    const notifications = await Notification.getUserNotifications(userId, options);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: "Notification IDs array is required",
      });
    }

    await Notification.markAsRead(userId, notificationIds);

    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      message: "Notifications marked as read",
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: "All notifications marked as read",
      data: { unreadCount: 0 },
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

// Create welcome notification for new user
const createWelcomeNotification = async (userId) => {
  try {
    await Notification.createWelcomeNotification(userId);
    console.log(`Welcome notification created for user ${userId}`);
  } catch (error) {
    console.error("Error creating welcome notification:", error);
  }
};

// Check and create project due soon notifications
const checkProjectDueDates = async () => {
  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find projects due in the next 24 hours
    const projectsDueSoon = await Project.find({
      dueDate: {
        $gte: now,
        $lte: twentyFourHoursFromNow,
      },
      status: { $ne: "Completed" },
    }).populate("clientId", "name");

    for (const project of projectsDueSoon) {
      // Check if notification already exists for this project
      const existingNotification = await Notification.findOne({
        userId: project.createdBy,
        type: "project_due_soon",
        "relatedEntity.id": project._id,
        createdAt: {
          $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      });

      if (!existingNotification) {
        await Notification.createProjectDueSoonNotification(
          project.createdBy,
          project._id,
          project.name,
          project.dueDate
        );
        console.log(`Project due soon notification created for project: ${project.name}`);
      }
    }
  } catch (error) {
    console.error("Error checking project due dates:", error);
  }
};

// Check and create task due soon notifications
const checkTaskDueDates = async () => {
  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find tasks due in the next 24 hours
    const tasksDueSoon = await Task.find({
      dueDate: {
        $gte: now,
        $lte: twentyFourHoursFromNow,
      },
      completed: false,
      isArchived: false,
    }).populate("projectId", "name");

    for (const task of tasksDueSoon) {
      // Check if notification already exists for this task
      const existingNotification = await Notification.findOne({
        userId: task.createdBy,
        type: "task_due_soon",
        "relatedEntity.id": task._id,
        createdAt: {
          $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      });

      if (!existingNotification) {
        await Notification.createTaskDueSoonNotification(
          task.createdBy,
          task._id,
          task.name,
          task.projectId.name,
          task.dueDate
        );
        console.log(`Task due soon notification created for task: ${task.name}`);
      }
    }
  } catch (error) {
    console.error("Error checking task due dates:", error);
  }
};

// Archive old notifications (run periodically)
const archiveOldNotifications = async () => {
  try {
    const result = await Notification.archiveOldNotifications(30); // Archive notifications older than 30 days
    console.log(`Archived ${result.modifiedCount} old notifications`);
  } catch (error) {
    console.error("Error archiving old notifications:", error);
  }
};

// Create notification for new client
const createClientAddedNotification = async (userId, clientName) => {
  try {
    await Notification.create({
      userId,
      type: "client_added",
      title: "New Client Added",
      message: `Client "${clientName}" has been successfully added to your client list.`,
      priority: "medium",
    });
  } catch (error) {
    console.error("Error creating client added notification:", error);
  }
};

// Create notification for payment received
const createPaymentReceivedNotification = async (userId, invoiceNumber, amount) => {
  try {
    await Notification.create({
      userId,
      type: "payment_received",
      title: "Payment Received",
      message: `Payment of $${amount} received for invoice ${invoiceNumber}.`,
      priority: "high",
    });
  } catch (error) {
    console.error("Error creating payment received notification:", error);
  }
};

// Create notification for invoice sent
const createInvoiceSentNotification = async (userId, invoiceNumber, clientName) => {
  try {
    await Notification.create({
      userId,
      type: "invoice_sent",
      title: "Invoice Sent",
      message: `Invoice ${invoiceNumber} has been sent to ${clientName}.`,
      priority: "medium",
    });
  } catch (error) {
    console.error("Error creating invoice sent notification:", error);
  }
};

// Create notification for project completed
const createProjectCompletedNotification = async (userId, projectName) => {
  try {
    await Notification.create({
      userId,
      type: "project_completed",
      title: "Project Completed",
      message: `Project "${projectName}" has been marked as completed.`,
      priority: "medium",
    });
  } catch (error) {
    console.error("Error creating project completed notification:", error);
  }
};

// Create notification for task completed
const createTaskCompletedNotification = async (userId, taskName, projectName) => {
  try {
    await Notification.create({
      userId,
      type: "task_completed",
      title: "Task Completed",
      message: `Task "${taskName}" in project "${projectName}" has been completed.`,
      priority: "low",
    });
  } catch (error) {
    console.error("Error creating task completed notification:", error);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createWelcomeNotification,
  checkProjectDueDates,
  checkTaskDueDates,
  archiveOldNotifications,
  createClientAddedNotification,
  createPaymentReceivedNotification,
  createInvoiceSentNotification,
  createProjectCompletedNotification,
  createTaskCompletedNotification,
};
