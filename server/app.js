const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const autoMessagesRoutes = require("./routes/autoMessagesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3001",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/email-templates", emailTemplateRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/auto-messages", autoMessagesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/files", fileRoutes);

// Simple API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from SoloDesk API!" });
});

// Debug endpoint to check database connection and users
app.get("/api/debug/users", async (req, res) => {
  try {
    const User = require("./models/User");
    const users = await User.find({})
      .select("email firstName lastName")
      .limit(5);
    res.json({
      message: "Database connection working",
      userCount: users.length,
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});

// Debug endpoint to test JWT token generation
app.get("/api/debug/jwt", (req, res) => {
  try {
    const generateToken = require("./utils/generateToken");
    const jwt = require("jsonwebtoken");

    const testUserId = "507f1f77bcf86cd799439011";
    const token = generateToken(testUserId);
    const secret =
      process.env.JWT_SECRET || "fallback-secret-for-development-only";

    // Verify the token
    const decoded = jwt.verify(token, secret);

    res.json({
      message: "JWT test successful",
      tokenGenerated: !!token,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + "...",
      decoded: decoded,
      secretExists: !!process.env.JWT_SECRET,
      secretLength: secret.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "JWT test failed",
      error: error.message,
    });
  }
});

// Debug endpoint to check invoices
app.get("/api/debug/invoices", async (req, res) => {
  try {
    const Invoice = require("./models/Invoice");
    const invoices = await Invoice.find({})
      .select("number clientEmail amount status createdBy")
      .limit(5);
    res.json({
      message: "Invoices found",
      invoiceCount: invoices.length,
      invoices: invoices,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});

// Debug endpoint to check clients
app.get("/api/debug/clients", async (req, res) => {
  try {
    const Client = require("./models/Client");
    const clients = await Client.find({})
      .select("name email createdBy")
      .limit(5);
    res.json({
      message: "Clients found",
      clientCount: clients.length,
      clients: clients,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});

// Debug endpoint to trigger notification checks
app.get("/api/debug/trigger-notifications", async (req, res) => {
  try {
    const { triggerNotificationChecks } = require("./services/notificationService");
    await triggerNotificationChecks();
    res.json({
      message: "Notification checks triggered successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error triggering notification checks",
      error: error.message,
    });
  }
});

// Debug endpoint to test receipt creation (no auth required)
app.post("/api/debug/test-receipt", async (req, res) => {
  try {
    const { invoiceId } = req.body;
    
    console.log('Testing receipt creation for invoice:', invoiceId);
    
    const Invoice = require("./models/Invoice");
    const Receipt = require("./models/Receipt");
    
    // Find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    console.log('Found invoice:', invoice.number, 'Client email:', invoice.clientEmail);
    
    // Test the createFromInvoice method
    const receipt = await Receipt.createFromInvoice(invoice, {
      paymentMethod: 'manual',
      paymentDate: new Date(),
      notes: 'Test receipt'
    });
    
    console.log('Receipt created successfully:', receipt.receiptNumber);
    
    res.json({
      success: true,
      message: 'Receipt creation test successful',
      receipt: {
        receiptNumber: receipt.receiptNumber,
        invoiceId: receipt.invoiceId,
        clientId: receipt.clientId,
        amount: receipt.amount
      }
    });
  } catch (error) {
    console.error('Receipt creation test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Receipt creation test failed',
      error: error.message
    });
  }
});

// Debug endpoint to get all receipts for an invoice (no auth required)
app.get("/api/debug/receipts/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    console.log('Getting all receipts for invoice:', invoiceId);
    
    const Receipt = require("./models/Receipt");
    
    const receipts = await Receipt.find({ invoiceId })
      .populate([
        { path: 'invoiceId', select: 'number amount items description' },
        { path: 'clientId', select: 'name email phone address' },
        { path: 'createdBy', select: 'firstName lastName businessName email phone website address' }
      ])
      .sort({ createdAt: -1 });

    console.log('Found receipts:', receipts.length);

    res.json({
      success: true,
      data: receipts
    });
  } catch (error) {
    console.error('Error getting receipts by invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get receipts by invoice',
      error: error.message
    });
  }
});

// Debug endpoint to test receipt sending (no auth required)
app.post("/api/debug/send-receipt/:receiptId", async (req, res) => {
  try {
    const { receiptId } = req.params;
    
    console.log('Testing receipt sending for receipt:', receiptId);
    
    const Receipt = require("./models/Receipt");
    const { sendReceiptEmail } = require("./services/emailService");
    const EmailTemplate = require("./models/EmailTemplate");
    
    // Find the receipt with populated data
    const receipt = await Receipt.findById(receiptId)
      .populate([
        { path: 'invoiceId', select: 'number amount items description' },
        { path: 'clientId', select: 'name email phone address' },
        { path: 'createdBy', select: 'firstName lastName businessName email phone website address' }
      ]);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    console.log('Found receipt:', receipt.receiptNumber);
    console.log('Client email:', receipt.clientId.email);

    // Get payment confirmation template
    let emailTemplate = null;
    try {
      emailTemplate = await EmailTemplate.findOne({ 
        userId: receipt.createdBy._id, 
        type: 'payment', 
        isDefault: true,
        isActive: true 
      }).maxTimeMS(5000);
    } catch (error) {
      console.log("Using default receipt template due to error:", error.message);
    }

    // Generate receipt HTML
    const generateReceiptHTML = (receipt, emailTemplate) => {
      const user = receipt.createdBy;
      const client = receipt.clientId;
      const invoice = receipt.invoiceId;

      // Format currency
      const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(amount);
      };

      // Format date
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Generate items table
      const itemsList = invoice.items ? invoice.items.map(item => 
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.rate || item.amount, receipt.currency)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.amount, receipt.currency)}</td>
        </tr>`
      ).join('') : '';

      // Use custom template if available, otherwise use default
      const subject = emailTemplate?.subject || `Receipt - ${receipt.receiptNumber}`;
      const tagline = emailTemplate?.tagline || 'Thank You for Your Payment';
      const thankYouTitle = emailTemplate?.thankYouTitle || 'Payment Received';
      const thankYouText = emailTemplate?.thankYouText || 'Thank you for your prompt payment. Your invoice has been marked as paid.';
      const nextStepsTitle = emailTemplate?.nextStepsTitle || 'What Happens Next';
      const nextSteps = emailTemplate?.nextSteps || ['Your receipt has been generated and attached to this email.', 'Please keep this receipt for your records.', 'We appreciate your business!'];

      const nextStepsList = nextSteps.map(step => 
        `<div class="next-step-item">
          <div class="next-step-icon">✓</div>
          <div class="next-step-text">${step}</div>
        </div>`
      ).join('');

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - ${user.businessName || 'SoloDesk'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #364153; background-color: #f9fafb; padding: 20px; }
    .receipt-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
    .header { background: #22c55e; padding: 32px 24px; text-align: center; }
    .logo { font-size: 28px; font-weight: 700; color: white; margin-bottom: 4px; letter-spacing: -0.02em; }
    .tagline { color: #dcfce7; font-size: 14px; font-weight: 500; }
    .content { padding: 32px 24px; }
    .receipt-title { color: #101828; font-size: 24px; font-weight: 600; margin-bottom: 20px; text-align: center; }
    .receipt-number { color: #4a5565; font-size: 16px; font-weight: 500; margin-bottom: 24px; text-align: center; }
    .business-info { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .business-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .business-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .business-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .business-value { color: #101828; font-weight: 600; font-size: 14px; }
    .client-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .client-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .client-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .client-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .client-value { color: #101828; font-weight: 600; font-size: 14px; }
    .transaction-details { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .transaction-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .transaction-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .transaction-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .transaction-value { color: #101828; font-weight: 600; font-size: 14px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .items-table th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; color: #101828; border-bottom: 1px solid #e5e7eb; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .total-section { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .total-title { font-size: 18px; font-weight: 600; color: #101828; margin-bottom: 12px; text-align: center; }
    .total-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .total-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .total-value { color: #101828; font-weight: 600; font-size: 14px; }
    .total-final { border-top: 2px solid #22c55e; padding-top: 8px; margin-top: 8px; }
    .total-final .total-label { font-size: 16px; font-weight: 600; color: #101828; }
    .total-final .total-value { font-size: 18px; font-weight: 700; color: #22c55e; }
    .next-steps { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .next-steps-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .next-step-item { display: flex; align-items: center; margin-bottom: 8px; padding: 6px 0; }
    .next-step-icon { width: 20px; height: 20px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-size: 10px; font-weight: bold; }
    .next-step-text { color: #4a5565; font-weight: 500; font-size: 14px; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { color: #6a7282; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    @media (max-width: 600px) { body { padding: 12px; } .receipt-container { border-radius: 8px; } .header { padding: 24px 16px; } .content { padding: 24px 16px; } .receipt-title { font-size: 20px; } }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="logo">${user.businessName || 'SoloDesk'}</div>
      <div class="tagline">${tagline}</div>
    </div>
    
    <div class="content">
      <h1 class="receipt-title">RECEIPT</h1>
      <div class="receipt-number">Receipt Number: ${receipt.receiptNumber}</div>
      
      <div class="business-info">
        <div class="business-title">Business Information</div>
        <div class="business-item">
          <span class="business-label">Business Name:</span>
          <span class="business-value">${user.businessName || 'SoloDesk'}</span>
        </div>
        <div class="business-item">
          <span class="business-label">Email:</span>
          <span class="business-value">${user.email || 'contact@solodesk.com'}</span>
        </div>
        ${user.phone ? `<div class="business-item">
          <span class="business-label">Phone:</span>
          <span class="business-value">${user.phone}</span>
        </div>` : ''}
        ${user.website ? `<div class="business-item">
          <span class="business-label">Website:</span>
          <span class="business-value">${user.website}</span>
        </div>` : ''}
        ${user.address ? `<div class="business-item">
          <span class="business-label">Address:</span>
          <span class="business-value">${user.address}</span>
        </div>` : ''}
      </div>
      
      <div class="client-info">
        <div class="client-title">Client Information</div>
        <div class="client-item">
          <span class="client-label">Client Name:</span>
          <span class="client-value">${client.name || client.email}</span>
        </div>
        <div class="client-item">
          <span class="client-label">Email:</span>
          <span class="client-value">${client.email}</span>
        </div>
        ${client.phone ? `<div class="client-item">
          <span class="client-label">Phone:</span>
          <span class="client-value">${client.phone}</span>
        </div>` : ''}
        ${client.address ? `<div class="client-item">
          <span class="client-label">Address:</span>
          <span class="client-value">${client.address}</span>
        </div>` : ''}
      </div>
      
      <div class="transaction-details">
        <div class="transaction-title">Payment Details</div>
        <div class="transaction-item">
          <span class="transaction-label">Payment Method:</span>
          <span class="transaction-value">${receipt.paymentMethod}</span>
        </div>
        <div class="transaction-item">
          <span class="transaction-label">Payment Date:</span>
          <span class="transaction-value">${formatDate(receipt.paymentDate)}</span>
        </div>
        <div class="transaction-item">
          <span class="transaction-label">Receipt Number:</span>
          <span class="transaction-value">${receipt.receiptNumber}</span>
        </div>
        <div class="transaction-item">
          <span class="transaction-label">Invoice Number:</span>
          <span class="transaction-value">${invoice.number}</span>
        </div>
      </div>
      
      ${invoice.items && invoice.items.length > 0 ? `<table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>` : ''}
      
      <div class="total-section">
        <div class="total-title">Payment Summary</div>
        <div class="total-item total-final">
          <span class="total-label">Total Amount:</span>
          <span class="total-value">${formatCurrency(receipt.amount, receipt.currency)}</span>
        </div>
      </div>

      <div class="next-steps">
        <div class="next-steps-title">${nextStepsTitle}</div>
        ${nextStepsList}
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Thank you for your business!<br>
        This is an official receipt from ${user.businessName || 'SoloDesk'}.<br>
        Please keep this receipt for your records.
      </p>
    </div>
  </div>
</body>
</html>`;
    };

    const receiptHTML = generateReceiptHTML(receipt, emailTemplate);

    // Send email
    const result = await sendReceiptEmail(
      receipt.clientId.email,
      emailTemplate?.subject || `Receipt - ${receipt.receiptNumber}`,
      receiptHTML,
      receipt.createdBy,
      receipt,
      emailTemplate
    );

    res.json({
      success: true,
      message: 'Receipt email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending receipt email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send receipt email',
      error: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "SoloDesk API is running" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
