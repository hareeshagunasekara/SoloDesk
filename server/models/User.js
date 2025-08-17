const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  convertToUserTimezone,
  calculateTimeDifference,
} = require("../utils/timezoneUtils");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    // Onboarding fields
    onboarding: {
      isCompleted: {
        type: Boolean,
        default: false,
      },
      currentStep: {
        type: Number,
        default: 1,
        min: 1,
        max: 3,
      },
      completedSteps: {
        type: [Number],
        default: [],
      },
    },
    // Profile setup (Step 1)
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty values
          // Check if it's a valid URL (with or without protocol)
          const urlPattern =
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          return urlPattern.test(v);
        },
        message: "Please provide a valid website URL",
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    country: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: null,
    },
    preferredCurrency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "CAD", "LKR", "INR", "AUD", "JPY"],
    },
    defaultServiceRate: {
      type: Number,
      min: [0, "Default service rate cannot be negative"],
    },
    freelancerType: {
      type: String,
      trim: true,
      // Free text, placeholder in UI: 'Add your role'
    },
    // Business preferences
    invoicePrefix: {
      type: String,
      trim: true,
      maxlength: [10, "Invoice prefix cannot exceed 10 characters"],
      default: "INV",
    },
    paymentTerms: {
      type: String,
      enum: ["0", "7", "15", "30", "60"],
      default: "30",
    },
    autoReminders: {
      type: Boolean,
      default: true,
    },
    dateFormat: {
      type: String,
      enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
      default: "MM/DD/YYYY",
    },
    timeFormat: {
      type: String,
      enum: ["12h", "24h"],
      default: "12h",
    },
    socialLinks: {
      linkedin: String,
      instagram: String,
      twitter: String,
      facebook: String,
      website: String,
    },
    // Client info (Step 2) - will be moved to separate Client model
    // Booking info (Step 3) - will be moved to separate Booking model
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login method
userSchema.methods.updateLastLogin = async function () {
  console.log("=== updateLastLogin Method Debug ===");
  console.log("1. Current lastLogin:", this.lastLogin);
  console.log("2. Setting lastLogin to new Date():", new Date());
  this.lastLogin = new Date();
  console.log("3. New lastLogin value:", this.lastLogin);
  console.log("4. Saving user...");
  const result = await this.save();
  console.log("5. User saved successfully");
  console.log("6. Final lastLogin value:", this.lastLogin);
  return result;
};

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Get formatted last login
userSchema.virtual("formattedLastLogin").get(function () {
  if (!this.lastLogin) return "Never";

  // Use timezone-aware calculation if country is available
  if (this.country) {
    try {
      const { diffInHours, diffInDays } = calculateTimeDifference(
        this.lastLogin,
        this.country,
      );

      console.log("DEBUG formattedLastLogin (timezone-aware):");
      console.log("  - country:", this.country);
      console.log("  - lastLogin:", this.lastLogin);
      console.log("  - diffInHours:", diffInHours);
      console.log("  - diffInDays:", diffInDays);

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      } else if (diffInDays === 1) {
        return "Yesterday";
      } else {
        return convertToUserTimezone(this.lastLogin, this.country);
      }
    } catch (error) {
      console.error("Error in timezone-aware calculation:", error);
      // Fall back to UTC calculation
    }
  }

  // Fallback to UTC calculation if no country or error
  const now = new Date();
  const lastLoginDate = new Date(this.lastLogin);
  const diffInMs = now.getTime() - lastLoginDate.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  console.log("DEBUG formattedLastLogin (UTC fallback):");
  console.log("  - lastLogin:", lastLoginDate.toISOString());
  console.log("  - now:", now.toISOString());
  console.log("  - diffInMs:", diffInMs);
  console.log("  - diffInHours:", diffInHours);
  console.log("  - diffInDays:", diffInDays);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else {
    return lastLoginDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
