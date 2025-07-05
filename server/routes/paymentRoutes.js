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

const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('items.*.name')
    .notEmpty()
    .withMessage('Product name is required'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('totalAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Total amount must be a positive number'),
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required')
]

const refundValidation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be a positive number'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters')
]

// All routes require authentication
router.use(auth)

// Payment routes
router.post('/create-intent', createPaymentIntentValidation, validate, paymentController.createPaymentIntent)
router.post('/confirm', paymentController.confirmPayment)
router.post('/orders', createOrderValidation, validate, paymentController.createOrder)
router.get('/orders/:id', paymentController.getOrderStatus)
router.get('/orders', paymentController.getUserOrders)
router.get('/history', paymentController.getPaymentHistory)

// Admin only routes
router.post('/refund', admin, refundValidation, validate, paymentController.processRefund)

module.exports = router 