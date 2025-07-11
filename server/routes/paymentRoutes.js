const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const paymentController = require('../controllers/paymentController')
const { auth, admin } = require('../middlewares/authMiddleware')
const validate = require('../middlewares/validate')

// Validation rules
const createPaymentIntentValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isIn(['usd', 'eur', 'gbp'])
    .withMessage('Currency must be usd, eur, or gbp')
]

// All routes require authentication
router.use(auth)

router.post('/create-intent', createPaymentIntentValidation, validate, paymentController.createPaymentIntent)

// ... keep any other non-order, non-refund payment routes ...

module.exports = router 