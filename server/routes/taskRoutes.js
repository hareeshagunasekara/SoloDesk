const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const Task = require('../models/Task');

// All routes are protected
router.use(auth);

// Get all tasks for a user
router.get('/', async (req, res) => {
  try {
    const { projectId, completed, assignedTo } = req.query;
    
    let query = {
      createdBy: req.user._id,
      isArchived: false
    };

    if (projectId) {
      query.projectId = projectId;
    }

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// Get a single task
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      createdBy: req.user._id,
      isArchived: false
    }).populate('projectId', 'name')
      .populate('assignedTo', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };

    const task = new Task(taskData);
    const savedTask = await task.save();

    await savedTask.populate('projectId', 'name');
    await savedTask.populate('assignedTo', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// Update a task
router.put('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        createdBy: req.user._id,
        isArchived: false
      },
      updateData,
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
     .populate('assignedTo', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// Delete a task (soft delete)
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      createdBy: req.user._id,
      isArchived: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.archive(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// Toggle task completion
router.put('/:taskId/toggle', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      createdBy: req.user._id,
      isArchived: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.completed) {
      await task.reopen(req.user._id);
    } else {
      await task.complete(req.user._id);
    }

    await task.populate('projectId', 'name');
    await task.populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: `Task ${task.completed ? 'completed' : 'reopened'} successfully`,
      data: task
    });

  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle task',
      error: error.message
    });
  }
});

module.exports = router; 