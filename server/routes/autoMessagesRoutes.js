const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(auth);

// Mock auto-messages data
const mockAutoMessages = [
  {
    id: 1,
    name: 'Invoice Reminder',
    type: 'invoice',
    subject: 'Payment Reminder - Invoice #{invoice_number}',
    content: 'Dear {client_name},\n\nThis is a friendly reminder that invoice #{invoice_number} for {amount} is due on {due_date}.\n\nPlease let us know if you have any questions.\n\nBest regards,\n{company_name}',
    trigger: 'invoice_due',
    isActive: true,
    lastSent: '2024-01-10',
  },
  {
    id: 2,
    name: 'Welcome Email',
    type: 'welcome',
    subject: 'Welcome to {businessName}!',
    content: 'Welcome! I\'m {userFirstName}, and I\'m excited to have you as a client...',
    trigger: 'client_created',
    isActive: true,
    lastSent: '2024-01-12',
  },

  {
    id: 3,
    name: 'Payment Confirmation',
    type: 'payment',
    subject: 'Payment Received - Thank You!',
    content: 'Dear {client_name},\n\nThank you for your payment of {amount} for invoice #{invoice_number}.\n\nYour payment has been processed successfully.\n\nBest regards,\n{company_name}',
    trigger: 'payment_received',
    isActive: true,
    lastSent: '2024-01-11',
  },
  {
    id: 4,
    name: 'Follow-up Email',
    type: 'followup',
    subject: 'Following up on {project_name}',
    content: 'Hi {client_name},\n\nI wanted to follow up on {project_name} and see if you have any feedback or questions.\n\nWe\'re here to help!\n\nBest regards,\n{company_name}',
    trigger: 'project_completed',
    isActive: true,
    lastSent: '2024-01-09',
  },
];

// Get all auto messages
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAutoMessages,
      message: "Auto messages retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve auto messages",
      error: error.message
    });
  }
});

// Get auto message by ID
router.get("/:id", (req, res) => {
  try {
    const message = mockAutoMessages.find(m => m.id === parseInt(req.params.id));
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Auto message not found"
      });
    }
    res.json({
      success: true,
      data: message,
      message: "Auto message retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve auto message",
      error: error.message
    });
  }
});

// Create new auto message
router.post("/", (req, res) => {
  try {
    const newMessage = {
      id: mockAutoMessages.length + 1,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockAutoMessages.push(newMessage);
    res.status(201).json({
      success: true,
      data: newMessage,
      message: "Auto message created successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create auto message",
      error: error.message
    });
  }
});

// Update auto message
router.put("/:id", (req, res) => {
  try {
    const index = mockAutoMessages.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Auto message not found"
      });
    }
    mockAutoMessages[index] = {
      ...mockAutoMessages[index],
      ...req.body,
      updatedAt: new Date()
    };
    res.json({
      success: true,
      data: mockAutoMessages[index],
      message: "Auto message updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update auto message",
      error: error.message
    });
  }
});

// Delete auto message
router.delete("/:id", (req, res) => {
  try {
    const index = mockAutoMessages.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Auto message not found"
      });
    }
    const deletedMessage = mockAutoMessages.splice(index, 1)[0];
    res.json({
      success: true,
      data: deletedMessage,
      message: "Auto message deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete auto message",
      error: error.message
    });
  }
});

// Toggle auto message active status
router.put("/:id/toggle", (req, res) => {
  try {
    const message = mockAutoMessages.find(m => m.id === parseInt(req.params.id));
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Auto message not found"
      });
    }
    message.isActive = !message.isActive;
    message.updatedAt = new Date();
    res.json({
      success: true,
      data: message,
      message: `Auto message ${message.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle auto message status",
      error: error.message
    });
  }
});

// Send test auto message
router.post("/:id/test", (req, res) => {
  try {
    const message = mockAutoMessages.find(m => m.id === parseInt(req.params.id));
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Auto message not found"
      });
    }
    // Mock sending test message
    res.json({
      success: true,
      message: "Test message sent successfully",
      data: {
        messageId: message.id,
        sentAt: new Date(),
        recipient: req.body.testEmail || "test@example.com"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send test message",
      error: error.message
    });
  }
});

// Duplicate auto message
router.post("/:id/duplicate", (req, res) => {
  try {
    const originalMessage = mockAutoMessages.find(m => m.id === parseInt(req.params.id));
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: "Auto message not found"
      });
    }
    const duplicatedMessage = {
      ...originalMessage,
      id: mockAutoMessages.length + 1,
      name: `${originalMessage.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockAutoMessages.push(duplicatedMessage);
    res.status(201).json({
      success: true,
      data: duplicatedMessage,
      message: "Auto message duplicated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to duplicate auto message",
      error: error.message
    });
  }
});

// Get templates
router.get("/templates", (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAutoMessages,
      message: "Templates retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve templates",
      error: error.message
    });
  }
});

module.exports = router;
