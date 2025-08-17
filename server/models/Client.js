const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Individual", "Company"],
      default: "Individual",
    },

    // Shared Fields
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Client name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: false,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    // Company-Specific Fields
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },

    // Relationship Tracking
    tags: {
      type: [String],
      enum: [
        "VIP",
        "high-budget",
        "retainer",
        "low-maintenance",
        "urgent",
        "weekly client",
        "quarterly review",
        "seasonal",
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Lead", "Archived"],
      default: "Lead",
    },

    lastContacted: { type: Date },
    notes: {
      type: [
        {
          content: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // Attachments & Links
    attachments: {
      type: [
        {
          filename: { type: String, required: true },
          originalName: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number, required: true },
          url: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    links: {
      type: [
        {
          title: { type: String, required: true },
          url: { type: String, required: true },
          description: String,
          type: {
            type: String,
            enum: [
              "project",
              "contract",
              "brief",
              "reference",
              "social",
              "other",
            ],
            default: "other",
          },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // Relationships (Reference IDs) - Commented out until models are created
    // projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    // invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
    // messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    // files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],

    // Meta
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
clientSchema.index({ createdBy: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ type: 1 });
clientSchema.index({ tags: 1 });
clientSchema.index({ lastContacted: 1 });
clientSchema.index({ name: "text", companyName: "text" });

// Virtual for full name
clientSchema.virtual("fullName").get(function () {
  return this.name;
});

// Pre-save middleware to ensure notes is always an array
clientSchema.pre("save", function (next) {
  if (this.notes === "" || this.notes === null || this.notes === undefined) {
    this.notes = [];
  }
  next();
});

// Ensure virtual fields are serialized
clientSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    return ret;
  },
});

module.exports = mongoose.model("Client", clientSchema);
