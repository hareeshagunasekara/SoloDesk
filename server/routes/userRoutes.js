const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { auth, admin } = require('../middlewares/authMiddleware')

// All routes require authentication
router.use(auth)

// Profile management routes (must come before parameterized routes)
router.get('/profile', userController.getUserProfile)
router.put('/profile', userController.updateUserProfile)
router.put('/avatar', userController.updateAvatar)
router.put('/logo', userController.updateLogo)
router.put('/password', userController.changePassword)
router.delete('/account', userController.deleteAccount)

// Test route for formattedLastLogin logic
router.get('/test-formatted-last-login', userController.testFormattedLastLogin)

// Admin only routes
router.get('/', admin, userController.getUsers)
router.get('/stats', admin, userController.getUserStats)
router.put('/:id', admin, userController.updateUser)
router.delete('/:id', admin, userController.deleteUser)

// User routes (must come after specific routes)
router.get('/:id', userController.getUserById)

module.exports = router 