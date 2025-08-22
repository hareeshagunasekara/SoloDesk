const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["welcome", "invoice_reminder", "payment_confirmation", "project_update", "follow_up"],
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
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
emailTemplateSchema.index({ userId: 1, type: 1 });
emailTemplateSchema.index({ userId: 1, isActive: 1 });

// Ensure only one default template per type per user
emailTemplateSchema.index({ userId: 1, type: 1, isDefault: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
