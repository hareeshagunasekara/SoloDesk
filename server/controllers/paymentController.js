const stripe = require('../config/stripe')
const Order = require('../models/Order')
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

// @desc    Create order
// @route   POST /api/payments/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentIntentId, shippingAddress, billingAddress } = req.body

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      paymentIntentId,
      shippingAddress,
      billingAddress,
      paymentMethod: 'stripe'
    })

    logger.info(`Order created for user: ${req.user.email}, Order ID: ${order._id}`)

    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    })
  } catch (error) {
    logger.error('Create order error:', error)
    res.status(500).json({ message: 'Error creating order' })
  }
}

// @desc    Get order status
// @route   GET /api/payments/orders/:id
// @access  Private
const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({
      success: true,
      order
    })
  } catch (error) {
    logger.error('Get order status error:', error)
    res.status(500).json({ message: 'Error retrieving order' })
  }
}

// @desc    Get user orders
// @route   GET /api/payments/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments({ user: req.user._id })

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Get user orders error:', error)
    res.status(500).json({ message: 'Error retrieving orders' })
  }
}

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .select('totalAmount status paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(20)

    const stats = await Order.getStats(req.user._id)

    res.json({
      success: true,
      orders,
      stats
    })
  } catch (error) {
    logger.error('Get payment history error:', error)
    res.status(500).json({ message: 'Error retrieving payment history' })
  }
}

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
      reason: 'requested_by_customer'
    })

    // Update order status
    const order = await Order.findOne({ paymentIntentId })
    if (order) {
      order.status = 'refunded'
      order.paymentStatus = 'refunded'
      order.refundReason = reason
      order.refundAmount = amount
      order.refundedAt = new Date()
      await order.save()
    }

    logger.info(`Refund processed for payment: ${paymentIntentId}`)

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    })
  } catch (error) {
    logger.error('Process refund error:', error)
    res.status(500).json({ message: 'Error processing refund' })
  }
}

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createOrder,
  getOrderStatus,
  getUserOrders,
  getPaymentHistory,
  processRefund
} 