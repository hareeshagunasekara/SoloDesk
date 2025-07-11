const User = require('../models/User')
const logger = require('../utils/logger')

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments({})

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    logger.error('Get user by ID error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email
    if (role) user.role = role
    if (typeof isActive === 'boolean') user.isActive = isActive

    await user.save()

    logger.info(`User updated by admin: ${user.email}`)

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        fullName: user.fullName
      }
    })
  } catch (error) {
    logger.error('Update user error:', error)
    res.status(500).json({ message: 'Server error during user update' })
  }
}

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    await User.findByIdAndDelete(req.params.id)

    logger.info(`User deleted by admin: ${user.email}`)

    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    logger.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error during user deletion' })
  }
}

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({})
    const activeUsers = await User.countDocuments({ isActive: true })
    const adminUsers = await User.countDocuments({ role: 'admin' })
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true })

    // Get users registered in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        verifiedUsers,
        recentUsers
      }
    })
  } catch (error) {
    logger.error('Get user stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.avatar = avatar
    await user.save()

    logger.info(`Avatar updated for user: ${user.email}`)

    res.json({
      success: true,
      user: {
        id: user._id,
        avatar: user.avatar
      }
    })
  } catch (error) {
    logger.error('Update avatar error:', error)
    res.status(500).json({ message: 'Server error during avatar update' })
  }
}

// @desc    Update user logo
// @route   PUT /api/users/logo
// @access  Private
const updateLogo = async (req, res) => {
  try {
    const { logo } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.logo = logo
    await user.save()

    logger.info(`Logo updated for user: ${user.email}`)

    res.json({
      success: true,
      user: {
        id: user._id,
        logo: user.logo
      }
    })
  } catch (error) {
    logger.error('Update logo error:', error)
    res.status(500).json({ message: 'Server error during logo update' })
  }
}

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    console.log('DEBUG getUserProfile: lastLogin =', user.lastLogin, 'formattedLastLogin =', user.formattedLastLogin);
    console.log('BBBB DEBUG formattedLastLogin calculation:');
    console.log('  - lastLogin type:', typeof user.lastLogin);
    console.log('  - lastLogin value:', user.lastLogin);
    console.log('  - current time:', new Date());
    console.log('  - server timezone offset:', new Date().getTimezoneOffset());
    console.log('  - server timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (user.lastLogin) {
      const now = new Date();
      const lastLoginDate = new Date(user.lastLogin);
      const diffInMs = now.getTime() - lastLoginDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      console.log('  - diffInMs:', diffInMs);
      console.log('  - diffInHours:', diffInHours);
      console.log('  - diffInDays:', diffInDays);
      console.log('  - diffInHours < 1:', diffInHours < 1);
      console.log('  - diffInHours < 24:', diffInHours < 24);
      console.log('  - diffInDays === 1:', diffInDays === 1);
    }
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        formattedLastLogin: user.formattedLastLogin
      }
    })
  } catch (error) {
    logger.error('Get user profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    console.log('=== Update Profile Request ===');
    console.log('1. Request body:', JSON.stringify(req.body, null, 2));
    console.log('2. User ID:', req.user._id);
    
    const {
      fullName,
      businessName,
      phone,
      website,
      bio,
      freelancerType,
      address,
      country,
      socialLinks,
      preferredCurrency,
      defaultServiceRate,
      invoicePrefix,
      paymentTerms,
      autoReminders,
      dateFormat,
      timeFormat
    } = req.body

    console.log('3. Extracted fields:');
    console.log('   - fullName:', fullName);
    console.log('   - businessName:', businessName);
    console.log('   - phone:', phone);
    console.log('   - website:', website);
    console.log('   - bio:', bio);
    console.log('   - freelancerType:', freelancerType);
    console.log('   - address:', address);
    console.log('   - country:', country);
    console.log('   - socialLinks:', socialLinks);
    console.log('   - preferredCurrency:', preferredCurrency);
    console.log('   - defaultServiceRate:', defaultServiceRate);
    console.log('   - invoicePrefix:', invoicePrefix);
    console.log('   - paymentTerms:', paymentTerms);
    console.log('   - autoReminders:', autoReminders);
    console.log('   - dateFormat:', dateFormat);
    console.log('   - timeFormat:', timeFormat);

    const user = await User.findById(req.user._id)
    if (!user) {
      console.log('4. User not found');
      return res.status(404).json({ message: 'User not found' })
    }

    console.log('5. Found user:', user.email);

    // Handle fullName by splitting into firstName and lastName
    if (fullName) {
      const nameParts = fullName.trim().split(' ')
      user.firstName = nameParts[0] || ''
      user.lastName = nameParts.slice(1).join(' ') || ''
      console.log('6. Split name - firstName:', user.firstName, 'lastName:', user.lastName);
    }

    // Update basic profile fields
    if (businessName !== undefined) user.businessName = businessName
    if (phone !== undefined) user.phone = phone
    if (website !== undefined) {
      // Ensure website has protocol
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        user.website = `https://${website}`;
      } else {
        user.website = website;
      }
      console.log('7. Website processed:', user.website);
    }
    if (bio !== undefined) user.bio = bio
    if (freelancerType !== undefined) user.freelancerType = freelancerType
    if (country !== undefined) user.country = country

    // Update address
    if (address !== undefined) {
      if (typeof address === 'string' && address.trim()) {
        // If address is a string, store it in a simple format
        user.address = { street: address.trim() }
      } else if (typeof address === 'object' && address !== null) {
        user.address = address
      } else if (address === '' || address === null) {
        // Clear address if empty string or null
        user.address = undefined
      }
      console.log('8. Address processed:', user.address);
    }

    // Update social links
    if (socialLinks && typeof socialLinks === 'object') {
      user.socialLinks = {
        ...user.socialLinks,
        ...socialLinks
      }
      console.log('9. Social links processed:', user.socialLinks);
    }

    // Update business preferences
    if (preferredCurrency !== undefined) user.preferredCurrency = preferredCurrency
    if (defaultServiceRate !== undefined) {
      const rate = Number(defaultServiceRate);
      if (!isNaN(rate) && rate >= 0) {
        user.defaultServiceRate = rate;
      } else {
        user.defaultServiceRate = 0;
      }
    }
    if (invoicePrefix !== undefined) user.invoicePrefix = invoicePrefix
    if (paymentTerms !== undefined) user.paymentTerms = String(paymentTerms)
    if (autoReminders !== undefined) user.autoReminders = Boolean(autoReminders)
    if (dateFormat !== undefined) user.dateFormat = dateFormat
    if (timeFormat !== undefined) user.timeFormat = timeFormat

    console.log('10. User object before save:', JSON.stringify(user.toObject(), null, 2));
    
    // Validate the user object before saving
    console.log('11. Validating user object...');
    const validationError = user.validateSync();
    if (validationError) {
      console.log('12. Validation error:', validationError);
      console.log('13. Validation error details:', validationError.errors);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.keys(validationError.errors).map(key => ({
          field: key,
          message: validationError.errors[key].message
        }))
      });
    }
    
    console.log('12. Validation passed, saving user...');
    await user.save()
    console.log('13. User saved successfully');

    logger.info(`Profile updated for user: ${user.email}`)

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        businessName: user.businessName,
        phone: user.phone,
        website: user.website,
        bio: user.bio,
        freelancerType: user.freelancerType,
        address: user.address,
        country: user.country,
        avatar: user.avatar,
        logo: user.logo,
        socialLinks: user.socialLinks,
        preferredCurrency: user.preferredCurrency,
        defaultServiceRate: user.defaultServiceRate,
        invoicePrefix: user.invoicePrefix,
        paymentTerms: user.paymentTerms,
        autoReminders: user.autoReminders,
        dateFormat: user.dateFormat,
        timeFormat: user.timeFormat,
        lastLogin: user.lastLogin,
        formattedLastLogin: user.formattedLastLogin
      }
    })
  } catch (error) {
    console.error('=== Update Profile Error ===');
    console.error('1. Error type:', error.constructor.name);
    console.error('2. Error message:', error.message);
    console.error('3. Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('4. Validation error details:');
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}:`, error.errors[key].message);
      });
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    if (error.name === 'CastError') {
      console.error('4. Cast error details:', error);
      return res.status(400).json({
        message: 'Invalid data type',
        field: error.path,
        value: error.value
      });
    }
    
    logger.error('Update user profile error:', error)
    res.status(500).json({ 
      message: 'Server error during profile update',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    })
  }
}

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    logger.info(`Password changed for user: ${user.email}`)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    logger.error('Change password error:', error)
    res.status(500).json({ message: 'Server error during password change' })
  }
}

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password is incorrect' })
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id)

    logger.info(`Account deleted for user: ${user.email}`)

    res.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    logger.error('Delete account error:', error)
    res.status(500).json({ message: 'Server error during account deletion' })
  }
}

// Test formattedLastLogin logic
const testFormattedLastLogin = async (req, res) => {
  try {
    const now = new Date();
    const testCases = [
      { name: 'Just now (30 minutes ago)', date: new Date(now.getTime() - 30 * 60 * 1000) },
      { name: '1 hour ago', date: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
      { name: '5 hours ago', date: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
      { name: '23 hours ago', date: new Date(now.getTime() - 23 * 60 * 60 * 1000) },
      { name: '25 hours ago (Yesterday)', date: new Date(now.getTime() - 25 * 60 * 60 * 1000) },
      { name: '3 days ago', date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { name: 'Never (null)', date: null }
    ];

    const results = testCases.map(testCase => {
      const user = { lastLogin: testCase.date };
      
      // Simulate the formattedLastLogin logic
      let formattedLastLogin;
      if (!user.lastLogin) {
        formattedLastLogin = 'Never';
      } else {
        const diffInHours = Math.floor((now - user.lastLogin) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
          formattedLastLogin = 'Just now';
        } else if (diffInHours < 24) {
          formattedLastLogin = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInHours < 48) {
          formattedLastLogin = 'Yesterday';
        } else {
          formattedLastLogin = user.lastLogin.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      
      return {
        testCase: testCase.name,
        lastLogin: user.lastLogin,
        diffInHours: user.lastLogin ? Math.floor((now - user.lastLogin) / (1000 * 60 * 60)) : null,
        formattedLastLogin: formattedLastLogin
      };
    });

    res.json({
      success: true,
      currentTime: now,
      testResults: results
    });
  } catch (error) {
    console.error('Test formattedLastLogin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  updateAvatar,
  updateLogo,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  testFormattedLastLogin
} 