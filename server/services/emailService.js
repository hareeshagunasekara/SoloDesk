const nodemailer = require('nodemailer')
const logger = require('../utils/logger')

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Welcome to SoloDesk!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to SoloDesk!</h2>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for registering with SoloDesk. We're excited to have you on board!</p>
            <p>Your account has been successfully created with the email: <strong>${user.email}</strong></p>
            <p>You can now:</p>
            <ul>
              <li>Browse our products</li>
              <li>Add items to your cart</li>
              <li>Complete secure payments</li>
              <li>Track your orders</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The SoloDesk Team</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Welcome email sent to: ${user.email}`)
    } catch (error) {
      logger.error('Send welcome email error:', error)
      throw error
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset Request - SoloDesk',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Password Reset Request</h2>
            <p>Hi ${user.firstName},</p>
            <p>You requested a password reset for your SoloDesk account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The SoloDesk Team</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Password reset email sent to: ${user.email}`)
    } catch (error) {
      logger.error('Send password reset email error:', error)
      throw error
    }
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(user, order) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Order Confirmation #${order._id} - SoloDesk`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Order Confirmation</h2>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for your order! We've received your payment and are processing your order.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>

            <h3>Items Ordered:</h3>
            <ul>
              ${order.items.map(item => `
                <li>${item.name} - Qty: ${item.quantity} - $${item.price}</li>
              `).join('')}
            </ul>

            <p>We'll send you an email when your order ships.</p>
            <p>Best regards,<br>The SoloDesk Team</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Order confirmation email sent to: ${user.email}`)
    } catch (error) {
      logger.error('Send order confirmation email error:', error)
      throw error
    }
  }

  // Send order shipped email
  async sendOrderShippedEmail(user, order, trackingNumber) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Order Shipped #${order._id} - SoloDesk`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Your Order Has Shipped!</h2>
            <p>Hi ${user.firstName},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Shipping Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>You can track your package using the tracking number above.</p>
            <p>Best regards,<br>The SoloDesk Team</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Order shipped email sent to: ${user.email}`)
    } catch (error) {
      logger.error('Send order shipped email error:', error)
      throw error
    }
  }

  // Send refund confirmation email
  async sendRefundConfirmationEmail(user, order, refundAmount) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Refund Processed #${order._id} - SoloDesk`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Refund Processed</h2>
            <p>Hi ${user.firstName},</p>
            <p>Your refund has been processed successfully.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Refund Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Refund Amount:</strong> $${refundAmount}</p>
              <p><strong>Refund Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>The refund will appear in your account within 5-10 business days.</p>
            <p>Best regards,<br>The SoloDesk Team</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Refund confirmation email sent to: ${user.email}`)
    } catch (error) {
      logger.error('Send refund confirmation email error:', error)
      throw error
    }
  }

  // Test email service
  async testEmail(to) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Test Email - SoloDesk',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Test Email</h2>
            <p>This is a test email from SoloDesk email service.</p>
            <p>If you received this email, the email service is working correctly.</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Test email sent to: ${to}`)
      return true
    } catch (error) {
      logger.error('Test email error:', error)
      throw error
    }
  }
}

module.exports = new EmailService() 