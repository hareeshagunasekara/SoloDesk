const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true,
    maxlength: [200, 'Service type cannot exceed 200 characters']
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative']
  },
  rateType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'project'],
    default: 'hourly'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Contact preferences
  contactPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    phone: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  // Billing information
  billingInfo: {
    taxId: String,
    paymentTerms: {
      type: String,
      default: 'net30',
      enum: ['net15', 'net30', 'net45', 'net60', 'due_on_receipt']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  }
}, {
  timestamps: true
})

// Indexes for better query performance
clientSchema.index({ userId: 1 })
clientSchema.index({ email: 1 })
clientSchema.index({ isActive: 1 })
clientSchema.index({ name: 'text', company: 'text' })

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  return this.name
})

// Ensure virtual fields are serialized
clientSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret
  }
})

module.exports = mongoose.model('Client', clientSchema) 