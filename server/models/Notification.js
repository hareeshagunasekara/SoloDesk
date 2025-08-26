const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "welcome",
        "project_due_soon",
        "task_due_soon",
        "project_overdue",
        "task_overdue",
        "payment_received",
        "invoice_sent",
        "client_added",
        "project_completed",
        "task_completed",
        "reminder"
      ],
      required: true,
    },

    // Notification title
    title: {
      type: String,
      required: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    // Notification message
    message: {
      type: String,
      required: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },

    // Related entity (optional)
    relatedEntity: {
      type: {
        type: String,
        enum: ["Project", "Task", "Invoice", "Client"],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedEntity.type",
      },
    },

    // Notification status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Scheduled notification (for future notifications)
    scheduledFor: {
      type: Date,
    },

    // Notification metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Soft delete
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ isArchived: 1 });

// Compound indexes for common queries
notificationSchema.index({ userId: 1, type: 1, isRead: 1 });
notificationSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInSeconds = Math.floor((now - created) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
});

// Static method to create welcome notification
notificationSchema.statics.createWelcomeNotification = function (userId) {
  return this.create({
    userId,
    type: "welcome",
    title: "Welcome to SoloDesk! 🎉",
    message: "Your account has been successfully created. Start managing your projects, clients, and invoices with ease!",
    priority: "medium",
  });
};

// Static method to create project due soon notification
notificationSchema.statics.createProjectDueSoonNotification = function (userId, projectId, projectName, dueDate) {
  const hoursUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60));
  
  return this.create({
    userId,
    type: "project_due_soon",
    title: `Project Due Soon: ${projectName}`,
    message: `Your project "${projectName}" is due in ${hoursUntilDue} hours. Make sure to complete it on time!`,
    relatedEntity: {
      type: "Project",
      id: projectId,
    },
    priority: "high",
    metadata: {
      dueDate,
      hoursUntilDue,
    },
  });
};

// Static method to create task due soon notification
notificationSchema.statics.createTaskDueSoonNotification = function (userId, taskId, taskName, projectName, dueDate) {
  const hoursUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60));
  
  return this.create({
    userId,
    type: "task_due_soon",
    title: `Task Due Soon: ${taskName}`,
    message: `Task "${taskName}" in project "${projectName}" is due in ${hoursUntilDue} hours.`,
    relatedEntity: {
      type: "Task",
      id: taskId,
    },
    priority: "high",
    metadata: {
      dueDate,
      hoursUntilDue,
      projectName,
    },
  });
};

// Static method to get unread notifications count
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    userId,
    isRead: false,
    isArchived: false,
  });
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function (userId, options = {}) {
  const query = {
    userId,
    isArchived: false,
  };

  if (options.unreadOnly) {
    query.isRead = false;
  }

  if (options.type) {
    query.type = options.type;
  }

  return this.find(query)
    .populate("relatedEntity.id")
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function (userId, notificationIds) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      userId,
    },
    {
      $set: { isRead: true },
    }
  );
};

// Static method to mark all notifications as read
notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    {
      userId,
      isRead: false,
      isArchived: false,
    },
    {
      $set: { isRead: true },
    }
  );
};

// Static method to archive old notifications
notificationSchema.statics.archiveOldNotifications = function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.updateMany(
    {
      createdAt: { $lt: cutoffDate },
      isRead: true,
      isArchived: false,
    },
    {
      $set: { isArchived: true },
    }
  );
};

// Ensure virtual fields are serialized
notificationSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
