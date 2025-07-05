const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hareeshanavodi:ES0t3JHKUSMaLH82@solodesk.0tpgn3y.mongodb.net/')

    console.log(`📦 MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.log('⚠️  Server will continue without database connection for development')
  }
}

module.exports = connectDB 