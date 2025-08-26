const Receipt = require('../models/Receipt');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const User = require('../models/User');
const { sendReceiptEmail } = require('../services/emailService');
const EmailTemplate = require('../models/EmailTemplate');

// Create a new receipt
exports.createReceipt = async (req, res) => {
  try {
    const { invoiceId, paymentData } = req.body;
    const userId = req.user._id;

    console.log('=== Receipt Creation Request ===');
    console.log('User ID:', userId);
    console.log('Invoice ID:', invoiceId);
    console.log('Payment data:', paymentData);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    // Validate invoice exists
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('Found invoice:', invoice.number, 'Client email:', invoice.clientEmail);

    // Check if receipt already exists for this invoice
    const existingReceipt = await Receipt.findOne({ invoiceId });
    if (existingReceipt) {
      return res.status(400).json({
        success: false,
        message: 'Receipt already exists for this invoice'
      });
    }

    // Create receipt from invoice
    const receipt = await Receipt.createFromInvoice(invoice, {
      paymentMethod: paymentData.paymentMethod || 'manual',
      paymentDate: paymentData.paymentDate || new Date(),
      notes: paymentData.notes || ''
    });

    await receipt.save();

    // Populate related data
    await receipt.populate([
      { path: 'invoiceId', select: 'number amount items' },
      { path: 'clientId', select: 'name email phone' },
      { path: 'createdBy', select: 'firstName lastName businessName email phone website' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Receipt created successfully',
      data: receipt
    });
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create receipt',
      error: error.message
    });
  }
};

// Get receipt by ID
exports.getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
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

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Error getting receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get receipt',
      error: error.message
    });
  }
};

// Get receipt by receipt number
exports.getReceiptByNumber = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ receiptNumber: req.params.receiptNumber })
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

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Error getting receipt by number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get receipt',
      error: error.message
    });
  }
};

// Get all receipts for a user
exports.getUserReceipts = async (req, res) => {
  try {
    const { sortBy = 'paymentDate', sortOrder = 'desc' } = req.query;

    const receipts = await Receipt.find({ createdBy: req.user._id })
      .populate([
        { path: 'invoiceId', select: 'number amount' },
        { path: 'clientId', select: 'name email' }
      ])
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    res.json({
      success: true,
      data: receipts
    });
  } catch (error) {
    console.error('Error getting user receipts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get receipts',
      error: error.message
    });
  }
};

// Get receipts for a specific client
exports.getClientReceipts = async (req, res) => {
  try {
    const { clientId } = req.params;

    const receipts = await Receipt.find({ 
      clientId, 
      createdBy: req.user._id 
    })
    .populate([
      { path: 'invoiceId', select: 'number amount items' },
      { path: 'createdBy', select: 'firstName lastName businessName' }
    ])
    .sort({ paymentDate: -1 });

    res.json({
      success: true,
      data: receipts
    });
  } catch (error) {
    console.error('Error getting client receipts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get client receipts',
      error: error.message
    });
  }
};

// Get receipts for a specific invoice
exports.getReceiptsByInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user._id;

    console.log('Getting receipts for invoice:', invoiceId, 'User:', userId);

    const receipts = await Receipt.find({ 
      invoiceId, 
      createdBy: userId 
    })
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
};

// Update receipt
exports.updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.receiptNumber;
    delete updateData.invoiceId;
    delete updateData.clientId;
    delete updateData.createdBy;

    const receipt = await Receipt.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'invoiceId', select: 'number amount items' },
      { path: 'clientId', select: 'name email phone' },
      { path: 'createdBy', select: 'firstName lastName businessName' }
    ]);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      message: 'Receipt updated successfully',
      data: receipt
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update receipt',
      error: error.message
    });
  }
};

// Delete receipt
exports.deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete receipt',
      error: error.message
    });
  }
};

// Generate receipt PDF (placeholder for future implementation)
exports.generateReceiptPDF = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
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

    // TODO: Implement PDF generation
    res.json({
      success: true,
      message: 'PDF generation not yet implemented',
      data: receipt
    });
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt PDF',
      error: error.message
    });
  }
};

// Get receipt statistics
exports.getReceiptStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'week':
        dateFilter = {
          paymentDate: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'month':
        dateFilter = {
          paymentDate: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
      case 'year':
        dateFilter = {
          paymentDate: {
            $gte: new Date(now.getFullYear(), 0, 1)
          }
        };
        break;
      default:
        dateFilter = {
          paymentDate: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
    }

    const stats = await Receipt.aggregate([
      {
        $match: {
          createdBy: userId,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalReceipts: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const paymentMethodStats = await Receipt.aggregate([
      {
        $match: {
          createdBy: userId,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || { totalReceipts: 0, totalAmount: 0, averageAmount: 0 },
        paymentMethods: paymentMethodStats
      }
    });
  } catch (error) {
    console.error('Error getting receipt stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get receipt statistics',
      error: error.message
    });
  }
};

// Send receipt email
exports.sendReceiptEmail = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const userId = req.user._id;

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

    // Check if user owns this receipt
    if (receipt.createdBy._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get payment confirmation template
    let emailTemplate = null;
    try {
      emailTemplate = await EmailTemplate.findOne({ 
        userId: userId, 
        type: 'payment', 
        isDefault: true,
        isActive: true 
      }).maxTimeMS(5000);
    } catch (error) {
      console.log("Using default receipt template due to error:", error.message);
    }

    // Generate receipt HTML
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
};

// Helper function to generate receipt HTML
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
