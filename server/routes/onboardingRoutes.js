const express = require('express')
const router = express.Router()
const {
  getOnboardingStatus,
  completeProfileSetup,
  addFirstClient,
  skipClientCreation,
  createFirstBooking,
  completeOnboarding,
  getUserClients
} = require('../controllers/onboardingController')
const { auth } = require('../middlewares/authMiddleware')

// All routes are protected
router.use(auth)

// Get onboarding status
router.get('/status', getOnboardingStatus)

// Step 1: Profile Setup
router.post('/profile', completeProfileSetup)

// Step 2: Add First Client
router.post('/client', addFirstClient)

// Step 2: Skip Client Creation
router.post('/skip-client', skipClientCreation)

// Step 3: Optional First Booking
router.post('/booking', createFirstBooking)

// Complete onboarding (skip step 3)
router.post('/complete', completeOnboarding)

// Get user's clients for booking step
router.get('/clients', getUserClients)

module.exports = router 