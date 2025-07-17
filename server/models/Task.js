const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Task Details
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },

  // Project Association
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },

  // Task Status
  completed: {
    type: Boolean,
    default: false
  },

  // Due Date
  dueDate: {
    type: Date
  },

  // Priority
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  // Task Type
  type: {
    type: String,
    enum: ['Task', 'Milestone', 'Bug', 'Feature', 'Research', 'Review'],
    default: 'Task'
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

  // Task Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Task Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Completion Tracking
  completedAt: {
    type: Date
  },

  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Task Dependencies
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],

  // Task Tags
  tags: {
    type: [String],
    default: []
  },

  // Task History
  history: {
    type: [{
      action: {
        type: String,
        required: true,
        enum: ['created', 'updated', 'completed', 'reopened', 'assigned', 'due_date_changed', 'priority_changed']
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

  // Task Order (for sorting within project)
  order: {
    type: Number,
    default: 0
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
taskSchema.index({ projectId: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ completed: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ isArchived: 1 });
taskSchema.index({ 'dependencies': 1 });

// Compound indexes for common queries
taskSchema.index({ projectId: 1, completed: 1 });
taskSchema.index({ projectId: 1, assignedTo: 1 });
taskSchema.index({ projectId: 1, dueDate: 1 });
taskSchema.index({ projectId: 1, priority: 1 });
taskSchema.index({ createdBy: 1, completed: 1 });
taskSchema.index({ assignedTo: 1, completed: 1 });

// Text index for search
taskSchema.index({ name: 'text', description: 'text' });

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual for completion time
taskSchema.virtual('completionTime').get(function() {
  if (!this.completedAt || !this.createdAt) return null;
  return this.completedAt.getTime() - this.createdAt.getTime();
});

// Pre-save middleware to add to history
taskSchema.pre('save', function(next) {
  if (this.isNew) {
    // This is a new task
    this.history.push({
      action: 'created',
      description: `Task "${this.name}" was created`,
      performedBy: this.createdBy,
      performedAt: new Date()
    });
  } else if (this.isModified('completed') && this.completed) {
    // Task was completed
    this.completedAt = new Date();
    this.history.push({
      action: 'completed',
      description: `Task "${this.name}" was completed`,
      performedBy: this.createdBy,
      performedAt: new Date(),
      metadata: {
        completedAt: this.completedAt
      }
    });
  } else if (this.isModified('completed') && !this.completed) {
    // Task was reopened
    this.completedAt = undefined;
    this.completedBy = undefined;
    this.history.push({
      action: 'reopened',
      description: `Task "${this.name}" was reopened`,
      performedBy: this.createdBy,
      performedAt: new Date()
    });
  } else if (this.isModified('assignedTo')) {
    // Task assignment changed
    this.history.push({
      action: 'assigned',
      description: `Task "${this.name}" was assigned`,
      performedBy: this.createdBy,
      performedAt: new Date(),
      metadata: {
        assignedTo: this.assignedTo
      }
    });
  } else if (this.isModified('dueDate')) {
    // Due date changed
    this.history.push({
      action: 'due_date_changed',
      description: `Due date for task "${this.name}" was changed`,
      performedBy: this.createdBy,
      performedAt: new Date(),
      metadata: {
        newDueDate: this.dueDate
      }
    });
  } else if (this.isModified('priority')) {
    // Priority changed
    this.history.push({
      action: 'priority_changed',
      description: `Priority for task "${this.name}" was changed to ${this.priority}`,
      performedBy: this.createdBy,
      performedAt: new Date(),
      metadata: {
        newPriority: this.priority
      }
    });
  } else if (this.isModified('isArchived') && this.isArchived) {
    // Task was archived
    this.history.push({
      action: 'archived',
      description: 'Task was archived',
      performedBy: this.archivedBy,
      performedAt: new Date()
    });
  } else if (this.isModified('isArchived') && !this.isArchived) {
    // Task was restored
    this.history.push({
      action: 'restored',
      description: 'Task was restored',
      performedBy: this.createdBy,
      performedAt: new Date()
    });
  }
  next();
});

// Method to complete task
taskSchema.methods.complete = function(completedBy) {
  this.completed = true;
  this.completedAt = new Date();
  this.completedBy = completedBy;
  
  return this.save();
};

// Method to reopen task
taskSchema.methods.reopen = function(reopenedBy) {
  this.completed = false;
  this.completedAt = undefined;
  this.completedBy = undefined;
  
  return this.save();
};

// Method to assign task
taskSchema.methods.assign = function(userId, assignedBy) {
  this.assignedTo = userId;
  
  return this.save();
};

// Method to archive task
taskSchema.methods.archive = function(archivedBy) {
  console.log('🔄 Archiving task:', this.name);
  console.log('👤 Archived by:', archivedBy);
  
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy;
  
  console.log('📝 Task state before save:', {
    isArchived: this.isArchived,
    archivedAt: this.archivedAt,
    archivedBy: this.archivedBy
  });
  
  return this.save();
};

// Method to restore task
taskSchema.methods.restore = function(restoredBy) {
  this.isArchived = false;
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  
  return this.save();
};

// Static method to get tasks by project
taskSchema.statics.getByProject = function(projectId, options = {}) {
  const query = {
    projectId: projectId,
    isArchived: false
  };
  
  if (options.completed !== undefined) {
    query.completed = options.completed;
  }
  
  if (options.assignedTo) {
    query.assignedTo = options.assignedTo;
  }
  
  return this.find(query)
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .populate('completedBy', 'firstName lastName')
    .sort({ order: 1, createdAt: 1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdue = function(userId) {
  return this.find({
    $or: [
      { createdBy: userId },
      { assignedTo: userId }
    ],
    dueDate: { $lt: new Date() },
    completed: false,
    isArchived: false
  }).populate('projectId', 'name')
    .populate('assignedTo', 'firstName lastName')
    .sort({ dueDate: 1 });
};

// Static method to get tasks due soon (within 7 days)
taskSchema.statics.getDueSoon = function(userId) {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return this.find({
    $or: [
      { createdBy: userId },
      { assignedTo: userId }
    ],
    dueDate: { 
      $gte: new Date(), 
      $lte: sevenDaysFromNow 
    },
    completed: false,
    isArchived: false
  }).populate('projectId', 'name')
    .populate('assignedTo', 'firstName lastName')
    .sort({ dueDate: 1 });
};

// Static method to get completed tasks
taskSchema.statics.getCompleted = function(projectId, limit = 10) {
  return this.find({
    projectId: projectId,
    completed: true,
    isArchived: false
  }).populate('completedBy', 'firstName lastName')
    .sort({ completedAt: -1 })
    .limit(limit);
};

// Static method to archive all tasks for a project
taskSchema.statics.archiveByProject = function(projectId, archivedBy) {
  return this.updateMany(
    { 
      projectId: projectId, 
      isArchived: false 
    },
    { 
      $set: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: archivedBy
      },
      $push: {
        history: {
          action: 'archived',
          description: 'Task was archived due to project deletion',
          performedBy: archivedBy,
          performedAt: new Date()
        }
      }
    }
  );
};

// Ensure virtual fields are serialized
taskSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

module.exports = mongoose.model('Task', taskSchema); 