const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Booking title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  location: {
    type: {
      type: String,
      enum: ['in_person', 'virtual', 'phone'],
      default: 'virtual'
    },
    address: String,
    meetingLink: String,
    phoneNumber: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Reminder settings
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    reminderTime: {
      type: Number, // minutes before booking
      default: 60
    }
  },
  // Payment information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'overdue'],
      default: 'pending'
    },
    amount: {
      type: Number,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: String,
    paymentDate: Date
  },
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  // Recurring booking settings
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    endAfter: {
      type: Number // number of occurrences
    },
    endDate: Date
  }
}, {
  timestamps: true
})

// Indexes for better query performance
bookingSchema.index({ userId: 1 })
bookingSchema.index({ clientId: 1 })
bookingSchema.index({ startDate: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ 'payment.status': 1 })
bookingSchema.index({ startDate: 1, endDate: 1 })

// Virtual for duration in hours
bookingSchema.virtual('durationHours').get(function() {
  return this.duration / 60
})

// Virtual for isOverdue
bookingSchema.virtual('isOverdue').get(function() {
  return this.payment.status === 'overdue'
})

// Virtual for isUpcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date() && this.status === 'scheduled'
})

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret
  }
})

module.exports = mongoose.model('Booking', bookingSchema) 