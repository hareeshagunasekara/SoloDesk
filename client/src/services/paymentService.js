import api from './api'

export const paymentService = {
  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const response = await api.post('/payments/create-intent', {
        amount,
        currency
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment intent')
    }
  },

  async confirmPayment(paymentIntentId) {
    try {
      const response = await api.post('/payments/confirm', {
        paymentIntentId
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment confirmation failed')
    }
  },

  async getPaymentHistory() {
    try {
      const response = await api.get('/payments/history')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get payment history')
    }
  },

  async createOrder(orderData) {
    try {
      const response = await api.post('/payments/orders', orderData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create order')
    }
  },

  async getOrderStatus(orderId) {
    try {
      const response = await api.get(`/payments/orders/${orderId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get order status')
    }
  },

  async refundPayment(paymentIntentId, amount) {
    try {
      const response = await api.post('/payments/refund', {
        paymentIntentId,
        amount
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Refund failed')
    }
  }
} 