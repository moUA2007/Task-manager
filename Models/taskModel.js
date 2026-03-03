const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task must have a title'],
    trim: true,
    minlength: 3,
    maxlength: 100
  },

  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  completed: {
    type: Boolean,
    default: false
  },

  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },

  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },

  estimatedHours: {
    type: Number,
    min: 1
  },

  category: {
    type: String,
    enum: ['Backend', 'Database', 'Security', 'DevOps', 'Frontend'],
    required: true
  },

  dueDate: {
    type: Date
  },

  // User ownership - each task belongs to a user
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Task must belong to a user']
  },

  createdAt: {
    type: Date,
    default: Date.now,
    select: true
  }

}, {
  timestamps: true
});

// Compound index for efficient user+task queries
taskSchema.index({ user: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;