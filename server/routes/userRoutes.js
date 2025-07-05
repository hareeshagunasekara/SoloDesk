const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { auth, admin } = require('../middlewares/authMiddleware')

// All routes require authentication
router.use(auth)

// Admin only routes
router.get('/', admin, userController.getUsers)
router.get('/stats', admin, userController.getUserStats)
router.put('/:id', admin, userController.updateUser)
router.delete('/:id', admin, userController.deleteUser)

// User routes
router.get('/:id', userController.getUserById)

module.exports = router 