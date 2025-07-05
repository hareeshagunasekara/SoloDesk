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

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} 