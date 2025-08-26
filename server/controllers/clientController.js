const Client = require("../models/Client");
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendClientWelcomeEmail } = require("../services/emailService");
const { createClientAddedNotification } = require("../controllers/notificationController");

// Get all clients for a user
const getClients = async (req, res) => {
  try {
    const {
      search,
      status,
      type,
      tags,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const userId = req.user._id;

    // Build query
    let query = { createdBy: userId };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const clients = await Client.find(query).sort(sort);
    // .populate('projects', 'name status')
    // .populate('invoices', 'amount status')
    // .populate('messages', 'subject createdAt')
    // .populate('files', 'name type');

    res.json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    logger.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

// Get single client by ID
const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const client = await Client.findOne({ _id: id, createdBy: userId });
    // .populate('projects', 'name status description startDate endDate')
    // .populate('invoices', 'amount status dueDate invoiceNumber')
    // .populate('messages', 'subject content createdAt')
    // .populate('files', 'name type size uploadedAt');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    logger.error("Error fetching client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client",
      error: error.message,
    });
  }
};

// Create new client
const createClient = async (req, res) => {
  try {
    const userId = req.user._id;
    const clientData = {
      ...req.body,
      createdBy: userId,
    };

    // Validate required fields
    if (!clientData.name || !clientData.email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Validate company fields if type is Company
    if (clientData.type === "Company" && !clientData.companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required for company clients",
      });
    }

    // Handle notes field - ensure it's an array
    if (
      clientData.notes === "" ||
      clientData.notes === null ||
      clientData.notes === undefined
    ) {
      clientData.notes = [];
    }

    // Validate tags - ensure they are from the predefined list
    if (clientData.tags && Array.isArray(clientData.tags)) {
      const validTags = [
        "VIP",
        "high-budget",
        "retainer",
        "low-maintenance",
        "urgent",
        "weekly client",
        "quarterly review",
        "seasonal",
      ];
      clientData.tags = clientData.tags.filter((tag) =>
        validTags.includes(tag),
      );
    }

    // Check if email already exists for this user
    const existingClient = await Client.findOne({
      email: clientData.email,
      createdBy: userId,
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists",
      });
    }

    const client = new Client(clientData);
    await client.save();

    // Send welcome email to the client
    try {
      // Pass user ID to email service so it can fetch complete user details
      await sendClientWelcomeEmail(client, { _id: userId });
      logger.info(`Welcome email sent to client: ${client.email}`);
    } catch (emailError) {
      // Log the error but don't fail the client creation
      logger.error("Failed to send welcome email to client:", emailError);
      // Continue with the response - email failure shouldn't break client creation
    }

    // Create notification for new client
    await createClientAddedNotification(userId, client.name);

    // Populate references - commented out until models are created
    // await client.populate('projects invoices messages files');

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    logger.error("Error creating client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Find client and ensure ownership
    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Validate company fields if type is Company
    if (updateData.type === "Company" && !updateData.companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required for company clients",
      });
    }

    // Handle notes field - ensure it's an array
    if (
      updateData.notes === "" ||
      updateData.notes === null ||
      updateData.notes === undefined
    ) {
      updateData.notes = [];
    }

    // Validate tags - ensure they are from the predefined list
    if (updateData.tags && Array.isArray(updateData.tags)) {
      const validTags = [
        "VIP",
        "high-budget",
        "retainer",
        "low-maintenance",
        "urgent",
        "weekly client",
        "quarterly review",
        "seasonal",
      ];
      updateData.tags = updateData.tags.filter((tag) =>
        validTags.includes(tag),
      );
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== client.email) {
      const existingClient = await Client.findOne({
        email: updateData.email,
        createdBy: userId,
        _id: { $ne: id },
      });

      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: "A client with this email already exists",
        });
      }
    }

    // Update client
    Object.assign(client, updateData);
    await client.save();

    // Populate references - commented out until models are created
    // await client.populate('projects invoices messages files');

    res.json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    logger.error("Error updating client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    await Client.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

// Add note to client
const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    client.notes.push({ content: content.trim() });
    await client.save();

    res.json({
      success: true,
      message: "Note added successfully",
      data: client.notes[client.notes.length - 1],
    });
  } catch (error) {
    logger.error("Error adding note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message,
    });
  }
};

// Update last contacted
const updateLastContacted = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { lastContacted } = req.body;

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    client.lastContacted = lastContacted || new Date();
    await client.save();

    res.json({
      success: true,
      message: "Last contacted updated successfully",
      data: { lastContacted: client.lastContacted },
    });
  } catch (error) {
    logger.error("Error updating last contacted:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update last contacted",
      error: error.message,
    });
  }
};

// Get client statistics
const getClientStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Client.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
          leads: { $sum: { $cond: [{ $eq: ["$status", "Lead"] }, 1, 0] } },
          inactive: {
            $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
          },
          archived: {
            $sum: { $cond: [{ $eq: ["$status", "Archived"] }, 1, 0] },
          },
          individuals: {
            $sum: { $cond: [{ $eq: ["$type", "Individual"] }, 1, 0] },
          },
          companies: { $sum: { $cond: [{ $eq: ["$type", "Company"] }, 1, 0] } },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      leads: 0,
      inactive: 0,
      archived: 0,
      individuals: 0,
      companies: 0,
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching client stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client statistics",
      error: error.message,
    });
  }
};

// Add attachment to client
const addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { filename, originalName, mimeType, size, url } = req.body;

    if (!filename || !originalName || !mimeType || !size || !url) {
      return res.status(400).json({
        success: false,
        message: "All attachment fields are required",
      });
    }

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const attachment = {
      filename,
      originalName,
      mimeType,
      size: parseInt(size),
      url,
      uploadedAt: new Date(),
    };

    client.attachments.push(attachment);
    await client.save();

    res.json({
      success: true,
      message: "Attachment added successfully",
      data: attachment,
    });
  } catch (error) {
    logger.error("Error adding attachment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add attachment",
      error: error.message,
    });
  }
};

// Remove attachment from client
const removeAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const userId = req.user._id;

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const attachmentIndex = client.attachments.findIndex(
      (attachment) => attachment._id.toString() === attachmentId,
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    client.attachments.splice(attachmentIndex, 1);
    await client.save();

    res.json({
      success: true,
      message: "Attachment removed successfully",
    });
  } catch (error) {
    logger.error("Error removing attachment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove attachment",
      error: error.message,
    });
  }
};

// Add link to client
const addLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, url, description, type } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: "Title and URL are required",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid URL",
      });
    }

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const link = {
      title: title.trim(),
      url: url.trim(),
      description: description ? description.trim() : "",
      type: type || "other",
      createdAt: new Date(),
    };

    client.links.push(link);
    await client.save();

    res.json({
      success: true,
      message: "Link added successfully",
      data: link,
    });
  } catch (error) {
    logger.error("Error adding link:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add link",
      error: error.message,
    });
  }
};

// Remove link from client
const removeLink = async (req, res) => {
  try {
    const { id, linkId } = req.params;
    const userId = req.user._id;

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const linkIndex = client.links.findIndex(
      (link) => link._id.toString() === linkId,
    );

    if (linkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    client.links.splice(linkIndex, 1);
    await client.save();

    res.json({
      success: true,
      message: "Link removed successfully",
    });
  } catch (error) {
    logger.error("Error removing link:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove link",
      error: error.message,
    });
  }
};

// Duplicate client
const duplicateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const originalClient = await Client.findOne({ _id: id, createdBy: userId });

    if (!originalClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Create a copy of the client data
    const clientData = originalClient.toObject();
    delete clientData._id;
    delete clientData.createdAt;
    delete clientData.updatedAt;

    // Modify the name/company name to indicate it's a copy
    if (clientData.type === "Company") {
      clientData.companyName = `${clientData.companyName} (Copy)`;
    } else {
      clientData.name = `${clientData.name} (Copy)`;
    }

    // Reset status to Lead for the duplicate
    clientData.status = "Lead";

    // Clear sensitive data
    clientData.notes = [];
    clientData.attachments = [];
    clientData.links = [];
    clientData.lastContacted = null;

    const duplicatedClient = new Client(clientData);
    await duplicatedClient.save();

    res.status(201).json({
      success: true,
      message: "Client duplicated successfully",
      data: duplicatedClient,
    });
  } catch (error) {
    logger.error("Error duplicating client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to duplicate client",
      error: error.message,
    });
  }
};

// Export client as PDF
const exportClientPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const client = await Client.findOne({ _id: id, createdBy: userId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // For now, return a simple JSON response
    // In a real implementation, you would generate a PDF here
    res.json({
      success: true,
      message: "PDF export functionality will be implemented soon",
      data: {
        clientId: client._id,
        clientName:
          client.type === "Company" ? client.companyName : client.name,
        exportDate: new Date(),
      },
    });
  } catch (error) {
    logger.error("Error exporting client PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export client PDF",
      error: error.message,
    });
  }
};

// Get projects for a specific client
const getClientProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // First verify the client exists and belongs to the user
    const client = await Client.findOne({ _id: id, createdBy: userId });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Import Project model
    const Project = require("../models/Project");

    // Get projects for this client
    const projects = await Project.find({ 
      clientId: id, 
      createdBy: userId,
      isArchived: { $ne: true } // Exclude archived projects
    })
    .select('name status description startDate endDate dueDate budget progress priority tags')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    logger.error("Error fetching client projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client projects",
      error: error.message,
    });
  }
};

// Get invoices for a specific client
const getClientInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // First verify the client exists and belongs to the user
    const client = await Client.findOne({ _id: id, createdBy: userId });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Get invoices for this client
    const invoices = await Invoice.find({ 
      clientEmail: client.email, 
      createdBy: userId 
    })
    .populate('projectId', 'name status dueDate')
    .select('number client clientEmail amount total currency status dueDate issueDate paidDate projectId items notes terms')
    .sort({ issueDate: -1 });

    // Transform the data to match frontend expectations
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice._id,
      number: invoice.number,
      client: invoice.client,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.dueDate,
      issueDate: invoice.issueDate,
      paidDate: invoice.paidDate,
      project: invoice.projectId ? invoice.projectId.name : null,
      projectId: invoice.projectId ? invoice.projectId._id : null,
      items: invoice.items,
      notes: invoice.notes,
      terms: invoice.terms,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    }));

    res.json({
      success: true,
      data: transformedInvoices,
      count: transformedInvoices.length,
    });
  } catch (error) {
    logger.error("Error fetching client invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client invoices",
      error: error.message,
    });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  addNote,
  updateLastContacted,
  getClientStats,
  addAttachment,
  removeAttachment,
  addLink,
  removeLink,
  duplicateClient,
  exportClientPDF,
  getClientProjects,
  getClientInvoices,
};
