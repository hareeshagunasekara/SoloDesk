const {
  checkProjectDueDates,
  checkTaskDueDates,
  archiveOldNotifications,
} = require("../controllers/notificationController");

// Schedule notification checks
let notificationInterval;

// Start the notification service
const startNotificationService = () => {
  console.log("🔔 Starting notification service...");
  
  // Check for due dates every hour
  notificationInterval = setInterval(async () => {
    try {
      console.log("⏰ Running scheduled notification checks...");
      
      // Check project due dates
      await checkProjectDueDates();
      
      // Check task due dates
      await checkTaskDueDates();
      
      // Archive old notifications (run once per day)
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() < 5) { // Run around 2 AM
        await archiveOldNotifications();
      }
      
      console.log("✅ Scheduled notification checks completed");
    } catch (error) {
      console.error("❌ Error in scheduled notification checks:", error);
    }
  }, 60 * 60 * 1000); // Check every hour
  
  console.log("✅ Notification service started successfully");
};

// Stop the notification service
const stopNotificationService = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    console.log("🛑 Notification service stopped");
  }
};

// Manual trigger for testing
const triggerNotificationChecks = async () => {
  try {
    console.log("🔔 Manually triggering notification checks...");
    
    await checkProjectDueDates();
    await checkTaskDueDates();
    
    console.log("✅ Manual notification checks completed");
  } catch (error) {
    console.error("❌ Error in manual notification checks:", error);
  }
};

module.exports = {
  startNotificationService,
  stopNotificationService,
  triggerNotificationChecks,
};

