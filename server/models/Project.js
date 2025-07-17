const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Project Details
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'On Hold', 'Completed'],
    default: 'Not Started'
  },

  // Timeline
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },

  // Optional Info
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Tasks - Now referenced from separate Task model
  // tasks: [] - Removed embedded tasks, now using Task model

  // Attachments
  attachments: {
    type: [{
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },

  // Project Notes
  notes: {
    type: [{
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }],
    default: []
  },

  // Project Settings
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative']
  },

  // Progress Tracking
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },

  // Time Tracking
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },

  // Project Categories/Tags
  tags: {
    type: [String],
    default: []
  },

  // Priority
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  // Relationships
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Project History
  history: {
    type: [{
      action: {
        type: String,
        required: true,
        enum: ['created', 'updated', 'status_changed', 'task_added', 'task_completed', 'file_uploaded', 'comment_added', 'archived', 'restored']
      },
      description: {
        type: String,
        required: true
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      performedAt: {
        type: Date,
        default: Date.now
      },
      metadata: {
        type: mongoose.Schema.Types.Mixed
      }
    }],
    default: []
  },

  // Soft Delete
  isArchived: {
    type: Boolean,
    default: false
  },

  archivedAt: {
    type: Date
  },

  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ createdBy: 1 });
projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ dueDate: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ isArchived: 1 });
projectSchema.index({ 'tasks.completed': 1 });
projectSchema.index({ name: 'text', description: 'text' });

// Compound indexes for common queries
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ createdBy: 1, dueDate: 1 });
projectSchema.index({ clientId: 1, status: 1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return null;
  const duration = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(duration / (1000 * 60 * 60 * 24)); // Days
});

// Virtual for days until due
projectSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
projectSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'Completed') return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual for completion percentage based on tasks (now calculated from Task model)
projectSchema.virtual('taskCompletionPercentage').get(function() {
  // This will be calculated when tasks are populated
  return this.progress || 0;
});

// Pre-save middleware to add to history
projectSchema.pre('save', function(next) {
  if (this.isNew) {
    // This is a new project
    this.history.push({
      action: 'created',
      description: `Project "${this.name}" was created`,
      performedBy: this.createdBy
    });
  } else if (this.isModified('status')) {
    // Status was changed
    this.history.push({
      action: 'status_changed',
      description: `Project status changed to "${this.status}"`,
      performedBy: this.createdBy,
      metadata: {
        previousStatus: this._original?.status,
        newStatus: this.status
      }
    });
  }
  next();
});

// Task methods are now handled by the Task model
// Use Task.create() to add tasks to a project
// Use Task.findById().complete() to complete tasks

// Method to archive project
projectSchema.methods.archive = function(archivedBy) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy;
  
  this.history.push({
    action: 'archived',
    description: 'Project was archived',
    performedBy: archivedBy
  });
  
  return this.save();
};

// Method to restore project
projectSchema.methods.restore = function(restoredBy) {
  this.isArchived = false;
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  
  this.history.push({
    action: 'restored',
    description: 'Project was restored',
    performedBy: restoredBy
  });
  
  return this.save();
};

// Static method to get projects by status
projectSchema.statics.getByStatus = function(status, userId) {
  return this.find({
    createdBy: userId,
    status: status,
    isArchived: false
  }).populate('clientId', 'name companyName').sort({ dueDate: 1 });
};

// Static method to get overdue projects
projectSchema.statics.getOverdue = function(userId) {
  return this.find({
    createdBy: userId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'Completed' },
    isArchived: false
  }).populate('clientId', 'name companyName').sort({ dueDate: 1 });
};

// Static method to get projects due soon (within 7 days)
projectSchema.statics.getDueSoon = function(userId) {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return this.find({
    createdBy: userId,
    dueDate: { 
      $gte: new Date(), 
      $lte: sevenDaysFromNow 
    },
    status: { $ne: 'Completed' },
    isArchived: false
  }).populate('clientId', 'name companyName').sort({ dueDate: 1 });
};

// Ensure virtual fields are serialized
projectSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

module.exports = mongoose.model('Project', projectSchema); 