import { tasksAPI } from './api'

class TaskService {
  // Get all tasks with optional filters
  async getAllTasks(params = {}) {
    try {
      const response = await tasksAPI.getAll(params)
      return {
        success: true,
        data: response.data.data || [],
        message: 'Tasks fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch tasks'
      }
    }
  }

  // Get tasks for a specific project
  async getProjectTasks(projectId) {
    try {
      const response = await tasksAPI.getAll({ projectId })
      return {
        success: true,
        data: response.data.data || [],
        message: 'Project tasks fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching project tasks:', error)
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch project tasks'
      }
    }
  }

  // Get a single task by ID
  async getTaskById(taskId) {
    try {
      const response = await tasksAPI.getById(taskId)
      return {
        success: true,
        data: response.data.data,
        message: 'Task fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching task:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch task'
      }
    }
  }

  // Create a new task
  async createTask(taskData) {
    try {
      const response = await tasksAPI.create(taskData)
      return {
        success: true,
        data: response.data.data,
        message: 'Task created successfully'
      }
    } catch (error) {
      console.error('Error creating task:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create task'
      }
    }
  }

  // Update a task
  async updateTask(taskId, updateData) {
    try {
      const response = await tasksAPI.update(taskId, updateData)
      return {
        success: true,
        data: response.data.data,
        message: 'Task updated successfully'
      }
    } catch (error) {
      console.error('Error updating task:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update task'
      }
    }
  }

  // Delete a task (soft delete)
  async deleteTask(taskId) {
    try {
      await tasksAPI.delete(taskId)
      return {
        success: true,
        data: null,
        message: 'Task deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to delete task'
      }
    }
  }

  // Toggle task completion status
  async toggleTaskComplete(taskId) {
    try {
      const response = await tasksAPI.toggleComplete(taskId)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Task status updated successfully'
      }
    } catch (error) {
      console.error('Error toggling task completion:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update task status'
      }
    }
  }

  // Update task priority
  async updateTaskPriority(taskId, priority) {
    try {
      const response = await tasksAPI.updatePriority(taskId, priority)
      return {
        success: true,
        data: response.data.data,
        message: 'Task priority updated successfully'
      }
    } catch (error) {
      console.error('Error updating task priority:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update task priority'
      }
    }
  }

  // Update task status
  async updateTaskStatus(taskId, status) {
    try {
      const response = await tasksAPI.updateStatus(taskId, status)
      return {
        success: true,
        data: response.data.data,
        message: 'Task status updated successfully'
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update task status'
      }
    }
  }

  // Assign task to a user
  async assignTask(taskId, userId) {
    try {
      const response = await tasksAPI.assignTo(taskId, userId)
      return {
        success: true,
        data: response.data.data,
        message: 'Task assigned successfully'
      }
    } catch (error) {
      console.error('Error assigning task:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to assign task'
      }
    }
  }

  // Add comment to a task
  async addTaskComment(taskId, comment) {
    try {
      const response = await tasksAPI.addComment(taskId, comment)
      return {
        success: true,
        data: response.data.data,
        message: 'Comment added successfully'
      }
    } catch (error) {
      console.error('Error adding task comment:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to add comment'
      }
    }
  }

  // Get comments for a task
  async getTaskComments(taskId) {
    try {
      const response = await tasksAPI.getComments(taskId)
      return {
        success: true,
        data: response.data.data || [],
        message: 'Comments fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching task comments:', error)
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch comments'
      }
    }
  }

  // Bulk operations
  async bulkUpdateTasks(taskIds, updateData) {
    try {
      const promises = taskIds.map(taskId => this.updateTask(taskId, updateData))
      const results = await Promise.all(promises)
      
      const successCount = results.filter(result => result.success).length
      const failureCount = results.length - successCount

      return {
        success: failureCount === 0,
        data: results,
        message: `Updated ${successCount} tasks${failureCount > 0 ? `, ${failureCount} failed` : ''}`
      }
    } catch (error) {
      console.error('Error in bulk update tasks:', error)
      return {
        success: false,
        data: null,
        message: 'Failed to update tasks'
      }
    }
  }

  async bulkDeleteTasks(taskIds) {
    try {
      const promises = taskIds.map(taskId => this.deleteTask(taskId))
      const results = await Promise.all(promises)
      
      const successCount = results.filter(result => result.success).length
      const failureCount = results.length - successCount

      return {
        success: failureCount === 0,
        data: results,
        message: `Deleted ${successCount} tasks${failureCount > 0 ? `, ${failureCount} failed` : ''}`
      }
    } catch (error) {
      console.error('Error in bulk delete tasks:', error)
      return {
        success: false,
        data: null,
        message: 'Failed to delete tasks'
      }
    }
  }

  // Utility methods
  formatTaskData(task) {
    return {
      id: task._id,
      name: task.name,
      description: task.description,
      projectId: task.projectId,
      completed: task.completed,
      dueDate: task.dueDate,
      priority: task.priority,
      type: task.type,
      actualHours: task.actualHours,
      assignedTo: task.assignedTo,
      dependencies: task.dependencies,
      tags: task.tags,
      order: task.order,
      history: task.history,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      completedBy: task.completedBy,
      daysUntilDue: task.daysUntilDue,
      isOverdue: task.isOverdue,
      completionTime: task.completionTime
    }
  }

  formatTasksList(tasks) {
    return tasks.map(task => this.formatTaskData(task))
  }
}

export default new TaskService() 