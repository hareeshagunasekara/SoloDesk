const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'],
  credentials: true
}))

app.use(express.json())

// Simple API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from SoloDesk API!' })
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