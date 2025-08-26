const EmailTemplate = require("../models/EmailTemplate");
const logger = require("../utils/logger");

// @desc    Get all email templates for a user
// @route   GET /api/email-templates
// @access  Private
const getEmailTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    let query = { userId };
    if (type) {
      query.type = type;
    }

    const templates = await EmailTemplate.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error("Get email templates error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single email template by ID
// @route   GET /api/email-templates/:id
// @access  Private
const getEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await EmailTemplate.findOne({ _id: id, userId });

    if (!template) {
      return res.status(404).json({ message: "Email template not found" });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error("Get email template error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new email template
// @route   POST /api/email-templates
// @access  Private
const createEmailTemplate = async (req, res) => {
  try {
    const userId = req.user._id;
    const templateData = {
      ...req.body,
      userId,
      createdBy: userId, // Add createdBy field as required by the model
    };

    // Validate required fields
    if (!templateData.type || !templateData.name || !templateData.subject) {
      return res.status(400).json({
        success: false,
        message: "Type, name, and subject are required",
      });
    }

    // If this is a default template, unset other defaults of the same type
    if (templateData.isDefault) {
      await EmailTemplate.updateMany(
        { userId, type: templateData.type },
        { isDefault: false }
      );
    }

    const template = new EmailTemplate(templateData);
    await template.save();

    logger.info(`Email template created: ${template.name} for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: "Email template created successfully",
      data: template,
    });
  } catch (error) {
    logger.error("Create email template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create email template",
      error: error.message,
    });
  }
};

// @desc    Update email template
// @route   PUT /api/email-templates/:id
// @access  Private
const updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const template = await EmailTemplate.findOne({ _id: id, userId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    // If this is a default template, unset other defaults of the same type
    if (updateData.isDefault) {
      await EmailTemplate.updateMany(
        { userId, type: template.type, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update template - exclude protected fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id' && key !== 'createdBy') {
        template[key] = updateData[key];
      }
    });

    await template.save();

    logger.info(`Email template updated: ${template.name} for user: ${userId}`);

    res.json({
      success: true,
      message: "Email template updated successfully",
      data: template,
    });
  } catch (error) {
    logger.error("Update email template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update email template",
      error: error.message,
    });
  }
};

// @desc    Delete email template
// @route   DELETE /api/email-templates/:id
// @access  Private
const deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await EmailTemplate.findOne({ _id: id, userId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    await EmailTemplate.findByIdAndDelete(id);

    logger.info(`Email template deleted: ${template.name} for user: ${userId}`);

    res.json({
      success: true,
      message: "Email template deleted successfully",
    });
  } catch (error) {
    logger.error("Delete email template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete email template",
      error: error.message,
    });
  }
};

// @desc    Get default email template by type
// @route   GET /api/email-templates/default/:type
// @access  Private
const getDefaultEmailTemplate = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user._id;

    const template = await EmailTemplate.findOne({ 
      userId, 
      type, 
      isDefault: true,
      isActive: true 
    });

    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: "Default email template not found" 
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error("Get default email template error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Bulk update email templates (status and archive)
// @route   PUT /api/email-templates/bulk-update
// @access  Private
const bulkUpdateEmailTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    const { changes } = req.body;

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Changes array is required and must not be empty",
      });
    }

    const updatePromises = changes.map(async (change) => {
      const { id, type, value } = change;
      
      // Validate the template exists and belongs to the user
      const template = await EmailTemplate.findOne({ _id: id, userId });
      if (!template) {
        throw new Error(`Template with ID ${id} not found`);
      }

      // Apply the change based on type
      switch (type) {
        case 'status':
          template.isActive = value;
          break;
        case 'archive':
          template.isArchived = value;
          template.isActive = false; // Archive also deactivates
          break;
        case 'unarchive':
          template.isArchived = false;
          template.isActive = value; // Unarchive and activate
          break;
        default:
          throw new Error(`Invalid change type: ${type}`);
      }

      await template.save();
      return template;
    });

    const updatedTemplates = await Promise.all(updatePromises);

    logger.info(`Bulk updated ${updatedTemplates.length} email templates for user: ${userId}`);

    res.json({
      success: true,
      message: `${updatedTemplates.length} templates updated successfully`,
      data: updatedTemplates,
    });
  } catch (error) {
    logger.error("Bulk update email templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update email templates",
      error: error.message,
    });
  }
};

// @desc    Get user data for email templates
// @route   GET /api/email-templates/user-data
// @access  Private
const getUserDataForEmailTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data needed for email templates
    const User = require("../models/User");
    const user = await User.findById(userId).select(
      'firstName lastName email phone businessName website address logo preferredCurrency bio freelancerType invoicePrefix paymentTerms autoReminders dateFormat timeFormat socialLinks'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Format the response to match what the InvoiceTemplateEditor expects
    const userData = {
      businessName: user.businessName || 'SoloDesk',
      email: user.email || 'user@example.com',
      phone: user.phone || 'Not set',
      website: user.website || 'Not set',
      firstName: user.firstName || 'User',
      lastName: user.lastName || 'Name',
      logo: user.logo || null,
      address: user.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      preferredCurrency: user.preferredCurrency || 'USD',
      bio: user.bio || '',
      freelancerType: user.freelancerType || '',
      invoicePrefix: user.invoicePrefix || 'INV',
      paymentTerms: user.paymentTerms || '30',
      autoReminders: user.autoReminders !== undefined ? user.autoReminders : true,
      dateFormat: user.dateFormat || 'MM/DD/YYYY',
      timeFormat: user.timeFormat || '12h',
      socialLinks: user.socialLinks || {
        linkedin: '',
        instagram: '',
        twitter: '',
        facebook: '',
        website: ''
      }
    };

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    logger.error("Get user data for email templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data for email templates",
      error: error.message,
    });
  }
};

// @desc    Create default email templates for a user
// @route   POST /api/email-templates/create-defaults
// @access  Private
const createDefaultEmailTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data
    const User = require("../models/User");
    const user = await User.findById(userId).select('firstName lastName email phone businessName website address logo');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already has templates
    const existingTemplates = await EmailTemplate.find({ userId });
    if (existingTemplates.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already has email templates",
      });
    }

    // Create default invoice template
    const emailTemplateService = require("../services/emailTemplateService");
    const defaultInvoiceTemplate = emailTemplateService.generateInvoiceEmailTemplate({}, user);
    
    const invoiceTemplate = new EmailTemplate({
      userId,
      createdBy: userId,
      type: 'invoice',
      name: 'Default Invoice Template',
      subject: 'Invoice #{invoiceNumber} - {businessName}',
      header: {
        title: 'INVOICE',
        subtitle: 'Professional Services'
      },
      businessDetails: {
        name: '{businessName}',
        address: '{businessAddress}',
        phone: '{businessPhone}',
        email: '{businessEmail}',
        website: '{businessWebsite}',
        logo: '{businessLogo}'
      },
      clientDetails: {
        name: '{clientName}',
        email: '{clientEmail}',
        address: '{clientAddress}',
        phone: '{clientPhone}'
      },
      invoiceDetails: {
        number: '{invoiceNumber}',
        date: '{invoiceDate}',
        dueDate: '{dueDate}',
        paymentTerms: 'Net 30 days',
        subtotal: '{subtotal}',
        taxRate: '{taxRate}',
        taxAmount: '{taxAmount}',
        total: '{total}'
      },
      items: [
        {
          description: 'Professional consultation and planning',
          quantity: '1',
          unitPrice: '{unitPrice}',
          amount: '{amount}'
        }
      ],
      paymentMethods: ['Bank Transfer', 'Credit Card', 'PayPal', 'Check'],
      paymentDescription: '',
      footer: {
        thankYou: 'Thank you for your business!',
        terms: 'Payment is due within 30 days of invoice date.',
        contact: 'If you have any questions, please contact us.'
      },
      html: defaultInvoiceTemplate.html,
      text: 'Invoice #{invoiceNumber} - {businessName}\n\nDear {clientName},\n\nPlease find your invoice attached.\n\nTotal Amount: {total}\nDue Date: {dueDate}\n\nThank you for your business!',
      isActive: true,
      isDefault: true
    });

    // Create default invoice reminder template
    const reminderTemplate = new EmailTemplate({
      userId,
      createdBy: userId,
      type: 'invoice_reminder',
      name: 'Default Invoice Reminder Template',
      subject: 'Payment Reminder - Invoice #{invoiceNumber}',
      header: {
        title: 'PAYMENT REMINDER',
        subtitle: 'Invoice #{invoiceNumber}'
      },
      businessDetails: {
        name: '{businessName}',
        address: '{businessAddress}',
        phone: '{businessPhone}',
        email: '{businessEmail}',
        website: '{businessWebsite}',
        logo: '{businessLogo}'
      },
      clientDetails: {
        name: '{clientName}',
        email: '{clientEmail}',
        address: '{clientAddress}',
        phone: '{clientPhone}'
      },
      invoiceDetails: {
        number: '{invoiceNumber}',
        date: '{invoiceDate}',
        dueDate: '{dueDate}',
        paymentTerms: 'Net 30 days',
        subtotal: '{subtotal}',
        taxRate: '{taxRate}',
        taxAmount: '{taxAmount}',
        total: '{total}'
      },
      items: [
        {
          description: 'Professional consultation and planning',
          quantity: '1',
          unitPrice: '{unitPrice}',
          amount: '{amount}'
        }
      ],
      paymentMethods: ['Bank Transfer', 'Credit Card', 'PayPal', 'Check'],
      paymentDescription: '',
      footer: {
        thankYou: 'Thank you for your business!',
        terms: 'Payment is due within 30 days of invoice date.',
        contact: 'If you have any questions, please contact us.'
      },
      html: defaultInvoiceTemplate.html,
      text: 'Payment Reminder - Invoice #{invoiceNumber}\n\nDear {clientName},\n\nThis is a friendly reminder that payment for invoice #{invoiceNumber} is due on {dueDate}.\n\nTotal Amount: {total}\n\nThank you for your business!',
      isActive: true,
      isDefault: true
    });

    // Save both templates
    await Promise.all([invoiceTemplate.save(), reminderTemplate.save()]);

    logger.info(`Default email templates created for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: "Default email templates created successfully",
      data: {
        invoiceTemplate,
        reminderTemplate
      },
    });
  } catch (error) {
    logger.error("Create default email templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create default email templates",
      error: error.message,
    });
  }
};

module.exports = {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  bulkUpdateEmailTemplates,
  deleteEmailTemplate,
  getDefaultEmailTemplate,
  getUserDataForEmailTemplates,
  createDefaultEmailTemplates,
};
