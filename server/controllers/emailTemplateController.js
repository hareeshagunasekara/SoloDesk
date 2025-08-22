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

    // Update template
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
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

module.exports = {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getDefaultEmailTemplate,
};
