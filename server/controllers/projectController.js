const Project = require("../models/Project");
const Task = require("../models/Task");
const Client = require("../models/Client");

// Create a new project with tasks
const createProject = async (req, res) => {
  try {
    const {
      name,
      clientId,
      status,
      startDate,
      endDate,
      dueDate,
      description,
      tasks, // Array of task objects from frontend
      attachments,
      budget,
      hourlyRate,
      priority,
      tags,
    } = req.body;

    // Create the project first
    const project = new Project({
      name,
      clientId,
      status,
      startDate,
      endDate,
      dueDate,
      description,
      attachments,
      budget,
      hourlyRate,
      priority,
      tags,
      createdBy: req.user._id,
    });

    const savedProject = await project.save();

    // Create tasks for the project if any were provided
    if (tasks && tasks.length > 0) {
      const taskPromises = tasks.map((taskData, index) => {
        return Task.create({
          name: taskData.name,
          description: taskData.description || "",
          projectId: savedProject._id,
          dueDate: taskData.dueDate,
          priority: taskData.priority || "Medium",
          type: taskData.type || "Task",
          order: index,
          createdBy: req.user._id,
        });
      });

      await Promise.all(taskPromises);
    }

    // Populate client information for response
    await savedProject.populate("clientId", "name companyName");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: savedProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Get all projects for a user
const getProjects = async (req, res) => {
  try {
    const { status, clientId, search } = req.query;

    let query = {
      createdBy: req.user._id,
      isArchived: false,
    };

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const projects = await Project.find(query)
      .populate("clientId", "name companyName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get a single project with its tasks
const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user._id,
      isArchived: false,
    }).populate("clientId", "name companyName email phone");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Get tasks for this project
    const tasks = await Task.getByProject(projectId);

    // Calculate project progress based on completed tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update project progress
    project.progress = progress;
    await project.save();

    res.status(200).json({
      success: true,
      data: {
        project,
        tasks,
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks,
          progress,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        createdBy: req.user._id,
        isArchived: false,
      },
      updateData,
      { new: true, runValidators: true },
    ).populate("clientId", "name companyName");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Delete a project (soft delete)
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user._id,
      isArchived: false,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Archive the project
    await project.archive(req.user._id);

    // Archive all tasks associated with this project
    const result = await Task.archiveByProject(projectId, req.user._id);

    console.log(
      `Successfully archived ${result.modifiedCount} tasks for project ${projectId}`,
    );

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// Get project statistics
const getProjectStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get project counts by status
    const projectStats = await Project.aggregate([
      {
        $match: {
          createdBy: userId,
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get task statistics
    const taskStats = await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$completed",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get overdue projects
    const overdueProjects = await Project.getOverdue(userId);

    // Get projects due soon
    const dueSoonProjects = await Project.getDueSoon(userId);

    const stats = {
      projects: {
        total: projectStats.reduce((sum, stat) => sum + stat.count, 0),
        byStatus: projectStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      },
      tasks: {
        total: taskStats.reduce((sum, stat) => sum + stat.count, 0),
        completed: taskStats.find((stat) => stat._id === true)?.count || 0,
        pending: taskStats.find((stat) => stat._id === false)?.count || 0,
      },
      overdue: overdueProjects.length,
      dueSoon: dueSoonProjects.length,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching project stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project statistics",
      error: error.message,
    });
  }
};

// Add note to project
const addNoteToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
      isArchived: false,
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const note = {
      content: content.trim(),
      createdAt: new Date(),
      createdBy: userId,
    };
    project.notes.push(note);
    await project.save();

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: project.notes[project.notes.length - 1],
    });
  } catch (error) {
    console.error("Error adding note to project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message,
    });
  }
};

// Delete note from project
const deleteNoteFromProject = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
      isArchived: false,
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Find the note index
    const noteIndex = project.notes.findIndex(
      (note) => note._id.toString() === noteId,
    );
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Remove the note
    project.notes.splice(noteIndex, 1);
    await project.save();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note from project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
  addNoteToProject,
  deleteNoteFromProject,
};
