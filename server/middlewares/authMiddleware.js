const jwt = require('jsonwebtoken')
const User = require('../models/User')
const logger = require('../utils/logger')

const auth = async (req, res, next) => {
  try {
    console.log('=== Auth Middleware Debug ===')
    console.log('Request URL:', req.url)
    console.log('Request method:', req.method)
    console.log('Request path:', req.path)
    console.log('All headers:', req.headers)
    
    const authHeader = req.header('Authorization')
    console.log('Auth middleware - Authorization header:', authHeader ? `"${authHeader}"` : 'missing')
    
    // Check for different header variations
    const authHeaderAlt = req.header('authorization')
    console.log('Auth middleware - authorization header (lowercase):', authHeaderAlt ? `"${authHeaderAlt}"` : 'missing')
    
    const token = authHeader?.replace('Bearer ', '') || authHeaderAlt?.replace('Bearer ', '')
    console.log('Auth middleware - Token extracted:', token ? `"${token.substring(0, 50)}..."` : 'missing')
    console.log('Auth middleware - Token length:', token ? token.length : 0)
    
    if (!token) {
      console.log('Auth middleware - No token provided')
      console.log('Available headers:', Object.keys(req.headers))
      console.log('========================')
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    console.log('Auth middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET)
    console.log('Auth middleware - JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0)
    
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-development-only'
    
    if (!process.env.JWT_SECRET) {
      console.warn('Auth middleware - JWT_SECRET not set, using fallback secret for development.')
    }
    
    console.log('Auth middleware - Attempting to verify token...')
    let decoded;
    try {
      decoded = jwt.verify(token, secret)
      console.log('Auth middleware - Token decoded successfully, userId:', decoded.userId)
    } catch (jwtError) {
      console.error('Auth middleware - JWT verification failed:', jwtError)
      console.log('Auth middleware - Error name:', jwtError.name)
      console.log('Auth middleware - Error message:', jwtError.message)
      
      if (jwtError.name === 'JsonWebTokenError') {
        console.log('Auth middleware - Invalid token')
        console.log('========================')
        return res.status(401).json({ message: 'Invalid token.' })
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        console.log('Auth middleware - Token expired')
        console.log('========================')
        return res.status(401).json({ message: 'Token expired.' })
      }
      
      console.log('Auth middleware - Unknown JWT error')
      console.log('========================')
      return res.status(401).json({ message: 'Token verification failed.' })
    }
    
    console.log('Auth middleware - Looking up user in database...')
    const user = await User.findById(decoded.userId).select('-password')
    console.log('Auth middleware - User found:', !!user, user ? user.email : 'none')
    
    if (!user) {
      console.log('Auth middleware - User not found in database')
      console.log('========================')
      return res.status(401).json({ message: 'Invalid token. User not found.' })
    }

    if (!user.isActive) {
      console.log('Auth middleware - User account is deactivated')
      console.log('========================')
      return res.status(401).json({ message: 'Account is deactivated.' })
    }

    console.log('Auth middleware - Authentication successful for user:', user.email)
    console.log('========================')
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    console.log('Auth middleware - Error name:', error.name)
    console.log('Auth middleware - Error message:', error.message)
    console.log('Auth middleware - Error stack:', error.stack)
    logger.error('Auth middleware error:', error)
    
    // Only return 500 for actual server errors, not authentication issues
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.log('Auth middleware - JWT error, returning 401')
      console.log('========================')
      return res.status(401).json({ message: 'Invalid token.' })
    }
    
    console.log('Auth middleware - Server error')
    console.log('========================')
    return res.status(500).json({ message: 'Server error during authentication.' })
  }
}

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication for optional routes
    next()
  }
}

module.exports = {
  auth,
  admin,
  optionalAuth
} 