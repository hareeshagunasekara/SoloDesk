const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')

// Import routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const onboardingRoutes = require('./routes/onboardingRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const clientRoutes = require('./routes/clientRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}))

app.use(express.json())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/onboarding', onboardingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

// Simple API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from SoloDesk API!' })
})

// Debug endpoint to check database connection and users
app.get('/api/debug/users', async (req, res) => {
  try {
    const User = require('./models/User')
    const users = await User.find({}).select('email firstName lastName').limit(5)
    res.json({ 
      message: 'Database connection working',
      userCount: users.length,
      users: users
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error',
      error: error.message
    })
  }
})

// Debug endpoint to test JWT token generation
app.get('/api/debug/jwt', (req, res) => {
  try {
    const generateToken = require('./utils/generateToken')
    const jwt = require('jsonwebtoken')
    
    const testUserId = '507f1f77bcf86cd799439011'
    const token = generateToken(testUserId)
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-development-only'
    
    // Verify the token
    const decoded = jwt.verify(token, secret)
    
    res.json({
      message: 'JWT test successful',
      tokenGenerated: !!token,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...',
      decoded: decoded,
      secretExists: !!process.env.JWT_SECRET,
      secretLength: secret.length
    })
  } catch (error) {
    res.status(500).json({
      message: 'JWT test failed',
      error: error.message
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SoloDesk API is running' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

module.exports = app 