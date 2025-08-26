const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generate receipt number: RCP-YYYY-XXXX
      const year = new Date().getFullYear();
      return `RCP-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'manual'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
receiptSchema.index({ invoiceId: 1 });
receiptSchema.index({ clientId: 1 });
receiptSchema.index({ createdBy: 1 });
receiptSchema.index({ paymentDate: -1 });

// Virtual for formatted receipt number
receiptSchema.virtual('formattedReceiptNumber').get(function() {
  return this.receiptNumber;
});

// Virtual for formatted payment date
receiptSchema.virtual('formattedPaymentDate').get(function() {
  return this.paymentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted amount
receiptSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Pre-save middleware to ensure receipt number is unique
receiptSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      const year = new Date().getFullYear();
      this.receiptNumber = `RCP-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const existingReceipt = await this.constructor.findOne({ receiptNumber: this.receiptNumber });
      if (!existingReceipt) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      return next(new Error('Unable to generate unique receipt number'));
    }
  }
  next();
});

// Static method to generate receipt from invoice
receiptSchema.statics.createFromInvoice = async function(invoice, receiptData = {}) {
  const Receipt = this;
  
  console.log('Creating receipt from invoice:', invoice._id);
  console.log('Invoice client email:', invoice.clientEmail);
  
  // Since Invoice model doesn't have clientId, we need to find the client by email
  let clientId = null;
  if (invoice.clientEmail) {
    try {
      const Client = require('./Client');
      const client = await Client.findOne({ email: invoice.clientEmail });
      console.log('Found client:', client ? client._id : 'not found');
      if (client) {
        clientId = client._id;
      }
    } catch (error) {
      console.error('Error finding client:', error);
      throw new Error(`Error finding client: ${error.message}`);
    }
  }
  
  // If no client found, we'll need to handle this case
  if (!clientId) {
    throw new Error(`Client not found for invoice with email: ${invoice.clientEmail}`);
  }
  
  const receipt = {
    invoiceId: invoice._id,
    clientId: clientId,
    createdBy: invoice.createdBy,
    paymentMethod: receiptData.paymentMethod || 'manual',
    amount: invoice.amount || 0,
    currency: invoice.currency || 'USD',
    paymentDate: receiptData.paymentDate || new Date(),
    notes: receiptData.notes || ''
  };
  
  console.log('Receipt data to create:', receipt);
  
  return new Receipt(receipt);
};

// Instance method to get receipt summary
receiptSchema.methods.getSummary = function() {
  return {
    receiptNumber: this.receiptNumber,
    formattedReceiptNumber: this.formattedReceiptNumber,
    amount: this.amount,
    formattedTotal: this.formattedTotal,
    paymentMethod: this.paymentMethod,
    paymentDate: this.formattedPaymentDate
  };
};

module.exports = mongoose.model('Receipt', receiptSchema);
