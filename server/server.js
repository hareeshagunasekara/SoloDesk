const app = require("./app");
const connectDB = require("./config/db");
const { startNotificationService } = require("./services/notificationService");

const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`SoloDesk API server running on http://localhost:${PORT}`);
  
  // Start notification service
  startNotificationService();
});
