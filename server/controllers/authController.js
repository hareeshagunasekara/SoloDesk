const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logger = require("../utils/logger");
const {
  sendResetEmail,
  generateResetToken,
} = require("../services/emailService");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        onboarding: user.onboarding,
        businessName: user.businessName,
        country: user.country,
        logo: user.logo,
        preferredCurrency: user.preferredCurrency,
        defaultServiceRate: user.defaultServiceRate,
      },
      token,
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    console.log("=== Login Debug ===");
    console.log("1. Before updateLastLogin - lastLogin:", user.lastLogin);
    console.log("2. Calling updateLastLogin...");
    await user.updateLastLogin();
    console.log("3. After updateLastLogin - lastLogin:", user.lastLogin);
    console.log("4. User saved successfully");

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        onboarding: user.onboarding,
        businessName: user.businessName,
        country: user.country,
        logo: user.logo,
        preferredCurrency: user.preferredCurrency,
        defaultServiceRate: user.defaultServiceRate,
      },
      token,
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        formattedLastLogin: user.formattedLastLogin,
        createdAt: user.createdAt,
        onboarding: user.onboarding,
        businessName: user.businessName,
        website: user.website,
        bio: user.bio,
        socialLinks: user.socialLinks,
        country: user.country,
        logo: user.logo,
        preferredCurrency: user.preferredCurrency,
        defaultServiceRate: user.defaultServiceRate,
      },
    });
  } catch (error) {
    logger.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      businessName,
      website,
      bio,
      socialLinks,
      country,
      preferredCurrency,
      defaultServiceRate,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (businessName) user.businessName = businessName;
    if (website) user.website = website;
    if (bio) user.bio = bio;
    if (socialLinks) user.socialLinks = socialLinks;
    if (country) user.country = country;
    if (preferredCurrency) user.preferredCurrency = preferredCurrency;
    if (defaultServiceRate !== undefined)
      user.defaultServiceRate = defaultServiceRate;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        fullName: user.fullName,
        businessName: user.businessName,
        website: user.website,
        bio: user.bio,
        socialLinks: user.socialLinks,
        country: user.country,
        logo: user.logo,
        preferredCurrency: user.preferredCurrency,
        defaultServiceRate: user.defaultServiceRate,
      },
    });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    logger.error("Change password error:", error);
    res.status(500).json({ message: "Server error during password change" });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    try {
      await sendResetEmail(email, resetToken, user.firstName);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      logger.error("Failed to send reset email:", emailError);
      // Clear the reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
      });
    }

    res.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Server error during password reset request" });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    // Find user by reset token and check if it's not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    logger.info(`User logged out: ${req.user.email}`);

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};
