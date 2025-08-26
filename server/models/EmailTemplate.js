const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["welcome", "invoice", "invoice_reminder", "payment_confirmation", "project_update", "follow_up"],
    },
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      default: "Your Solo Business, Simplified",
    },
    highlightTitle: {
      type: String,
      default: "What to Expect",
    },
    highlightText: {
      type: String,
      default: "Professional service, clear communication, and results that exceed your expectations.",
    },
    servicesTitle: {
      type: String,
      default: "How I Can Help You",
    },
    services: {
      type: [String],
      default: [
        "Professional consultation and planning",
        "Clear communication throughout the process",
        "Quality deliverables on time",
        "Ongoing support and follow-up"
      ],
    },
    // Invoice template specific fields
    businessDetails: {
      name: { type: String, default: '{businessName}' },
      address: { type: String, default: '{businessAddress}' },
      phone: { type: String, default: '{businessPhone}' },
      email: { type: String, default: '{businessEmail}' },
      website: { type: String, default: '{businessWebsite}' },
      logo: { type: String, default: '{businessLogo}' }
    },
    clientDetails: {
      name: { type: String, default: '{clientName}' },
      email: { type: String, default: '{clientEmail}' },
      address: { type: String, default: '{clientAddress}' },
      phone: { type: String, default: '{clientPhone}' }
    },
    invoiceDetails: {
      number: { type: String, default: '{invoiceNumber}' },
      date: { type: String, default: '{invoiceDate}' },
      dueDate: { type: String, default: '{dueDate}' },
      paymentTerms: { type: String, default: 'Net 30 days' },
      subtotal: { type: String, default: '{subtotal}' },
      taxRate: { type: String, default: '{taxRate}' },
      taxAmount: { type: String, default: '{taxAmount}' },
      total: { type: String, default: '{total}' }
    },
    items: [{
      description: { type: String, default: 'Professional consultation and planning' },
      quantity: { type: String, default: '1' },
      unitPrice: { type: String, default: '{unitPrice}' },
      amount: { type: String, default: '{amount}' }
    }],
    paymentMethods: {
      type: [String],
      default: ['Bank Transfer', 'Credit Card', 'PayPal', 'Check']
    },
    paymentDescription: {
      type: String,
      default: ''
    },
    footer: {
      thankYou: { type: String, default: 'Thank you for your business!' },
      terms: { type: String, default: 'Payment is due within 30 days of invoice date.' },
      contact: { type: String, default: 'If you have any questions, please contact us.' }
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
emailTemplateSchema.index({ userId: 1, type: 1 });
emailTemplateSchema.index({ userId: 1, isActive: 1 });
emailTemplateSchema.index({ userId: 1, isArchived: 1 });
emailTemplateSchema.index({ createdBy: 1, type: 1 });
emailTemplateSchema.index({ createdBy: 1, isActive: 1 });
emailTemplateSchema.index({ createdBy: 1, isArchived: 1 });

// Ensure only one default template per type per user
emailTemplateSchema.index({ userId: 1, type: 1, isDefault: 1 }, { unique: true, sparse: true });
emailTemplateSchema.index({ createdBy: 1, type: 1, isDefault: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
