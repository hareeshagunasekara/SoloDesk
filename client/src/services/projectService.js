import { projectsAPI } from './api';

// Project service functions
export const projectService = {
  // Get all projects
  getAllProjects: async (params = {}) => {
    try {
      const response = await projectsAPI.getAll(params);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
  },

  // Get a single project by ID
  getProjectById: async (projectId) => {
    try {
      const response = await projectsAPI.getById(projectId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project');
    }
  },

  // Create a new project
  createProject: async (projectData) => {
    try {
      console.log('projectService.createProject called with:', projectData);
      const response = await projectsAPI.create(projectData);
      console.log('projectService.createProject response:', response.data);
      return response.data;
    } catch (error) {
      console.error('projectService.createProject error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  },

  // Update a project
  updateProject: async (projectId, updateData) => {
    try {
      const response = await projectsAPI.update(projectId, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    try {
      const response = await projectsAPI.delete(projectId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  },

  // Get project tasks
  getProjectTasks: async (projectId) => {
    try {
      const response = await projectsAPI.getTasks(projectId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project tasks');
    }
  },

  // Get project time entries
  getProjectTimeEntries: async (projectId) => {
    try {
      const response = await projectsAPI.getTimeEntries(projectId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project time entries');
    }
  },

  // Duplicate a project
  duplicateProject: async (projectId) => {
    try {
      const response = await projectsAPI.duplicate(projectId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to duplicate project');
    }
  },

  // Archive a project
  archiveProject: async (projectId) => {
    try {
      const response = await projectsAPI.archive(projectId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to archive project');
    }
  }
};

// Export individual functions for convenience
export const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  getProjectTimeEntries,
  duplicateProject,
  archiveProject
} = projectService; 