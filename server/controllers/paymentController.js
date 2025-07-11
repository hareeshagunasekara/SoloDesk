const stripe = require('../config/stripe')
const logger = require('../utils/logger')

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user._id.toString()
      }
    })

    logger.info(`Payment intent created for user: ${req.user.email}`)

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    logger.error('Create payment intent error:', error)
    res.status(500).json({ message: 'Error creating payment intent' })
  }
}

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      logger.info(`Payment confirmed for user: ${req.user.email}`)
      
      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      })
    } else {
      res.status(400).json({ message: 'Payment not completed' })
    }
  } catch (error) {
    logger.error('Confirm payment error:', error)
    res.status(500).json({ message: 'Error confirming payment' })
  }
}

module.exports = {
  createPaymentIntent,
  confirmPayment
} 