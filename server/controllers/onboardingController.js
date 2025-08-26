const User = require("../models/User");
const Client = require("../models/Client");
const logger = require("../utils/logger");

// @desc    Get onboarding status
// @route   GET /api/onboarding/status
// @access  Private
const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      onboarding: user.onboarding,
      profile: {
        fullName: user.fullName,
        businessName: user.businessName,
        country: user.country,
        logo: user.logo,
        preferredCurrency: user.preferredCurrency,
        defaultServiceRate: user.defaultServiceRate,
      },
    });
  } catch (error) {
    logger.error("Get onboarding status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Complete step 1 - Profile Setup
// @route   POST /api/onboarding/profile
// @access  Private
const completeProfileSetup = async (req, res) => {
  try {
    const {
      fullName,
      businessName,
      country,
      logo,
      preferredCurrency,
      defaultServiceRate,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile fields
    if (fullName !== undefined) {
      const nameParts = fullName.trim().split(" ");
      user.firstName = nameParts[0] || "";
      user.lastName = nameParts.slice(1).join(" ") || "";
    }
    if (businessName !== undefined) user.businessName = businessName;
    if (country !== undefined) user.country = country;
    if (logo !== undefined) user.logo = logo;
    if (preferredCurrency !== undefined)
      user.preferredCurrency = preferredCurrency;
    if (defaultServiceRate !== undefined)
      user.defaultServiceRate = defaultServiceRate;

    // Update onboarding progress
    if (!user.onboarding.completedSteps.includes(1)) {
      user.onboarding.completedSteps.push(1);
    }
    user.onboarding.currentStep = 2;

    await user.save();

    logger.info(`Profile setup completed for user: ${user.email}`);

    res.json({
      success: true,
      message: "Profile setup completed successfully",
      onboarding: user.onboarding,
      profile: {
        fullName: user.fullName,
        businessName: user.businessName,
        country: user.country,
        logo: user.logo,
        preferredCurrency: user.preferredCurrency,
        defaultServiceRate: user.defaultServiceRate,
      },
    });
  } catch (error) {
    logger.error("Profile setup error:", error);
    res.status(500).json({ message: "Server error during profile setup" });
  }
};

// @desc    Skip step 2 - Client Creation
// @route   POST /api/onboarding/skip-client
// @access  Private
const skipClientCreation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update onboarding progress to step 3
    if (!user.onboarding.completedSteps.includes(2)) {
      user.onboarding.completedSteps.push(2);
    }
    user.onboarding.currentStep = 3;

    await user.save();

    logger.info(`Client creation skipped for user: ${user.email}`);

    res.json({
      success: true,
      message: "Client creation skipped successfully",
      onboarding: user.onboarding,
    });
  } catch (error) {
    logger.error("Skip client creation error:", error);
    res.status(500).json({ message: "Server error during client skip" });
  }
};

// @desc    Complete step 2 - Add First Client
// @route   POST /api/onboarding/client
// @access  Private
const addFirstClient = async (req, res) => {
  try {
    const { name, email, phone, tags, serviceType, customRate, notes } =
      req.body;

    // Validate required fields
    if (!name || !serviceType) {
      return res.status(400).json({
        message: "Name and service type are required",
      });
    }

    // Get user's default rate if custom rate not provided
    const currentUser = await User.findById(req.user._id);
    const rate = customRate || currentUser.defaultServiceRate || 0;

    // Create client
    const client = await Client.create({
      userId: req.user._id,
      name,
      email,
      phone,
      serviceType,
      rate,
      rateType: "hourly",
      tags: tags || [],
      notes,
    });

    // Update user onboarding progress
    const user = await User.findById(req.user._id);
    if (!user.onboarding.completedSteps.includes(2)) {
      user.onboarding.completedSteps.push(2);
    }
    user.onboarding.currentStep = 3;

    await user.save();

    logger.info(`First client added for user: ${user.email}`);

    res.status(201).json({
      success: true,
      message: "Client added successfully",
      client,
      onboarding: user.onboarding,
    });
  } catch (error) {
    logger.error("Add first client error:", error);
    res.status(500).json({ message: "Server error during client creation" });
  }
};



// @desc    Skip step 3 and complete onboarding
// @route   POST /api/onboarding/complete
// @access  Private
const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark onboarding as completed
    user.onboarding.isCompleted = true;
    user.onboarding.currentStep = 3;

    await user.save();

    logger.info(`Onboarding completed for user: ${user.email}`);

    res.json({
      success: true,
      message: "Onboarding completed successfully",
      onboarding: user.onboarding,
    });
  } catch (error) {
    logger.error("Complete onboarding error:", error);
    res
      .status(500)
      .json({ message: "Server error during onboarding completion" });
  }
};

// @desc    Get user's clients
// @route   GET /api/onboarding/clients
// @access  Private
const getUserClients = async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user._id, isActive: true })
      .select("name email company serviceType rate rateType")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      clients,
    });
  } catch (error) {
    logger.error("Get user clients error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getOnboardingStatus,
  completeProfileSetup,
  addFirstClient,
  skipClientCreation,
  completeOnboarding,
  getUserClients,
};
