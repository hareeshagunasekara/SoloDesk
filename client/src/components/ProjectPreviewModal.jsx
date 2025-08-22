import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, DollarSign, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { projectService } from '../services/projectService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

const ProjectPreviewModal = ({ isOpen, onClose, onCreateInvoice }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjectsAndInvoices();
    }
  }, [isOpen]);

  // Expose refresh function to parent component
  useEffect(() => {
    if (window) {
      window.refreshProjectPreviewModal = fetchProjectsAndInvoices;
    }
    return () => {
      if (window) {
        delete window.refreshProjectPreviewModal;
      }
    };
  }, []);

  const fetchProjectsAndInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only projects that don't have invoices assigned
      const response = await projectService.getProjectsAvailableForInvoice();
      const projectsData = response.data || response || [];
      
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects available for invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = (project) => {
    setSelectedProject(project);
    onCreateInvoice(project);
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'On Hold':
        return 'text-yellow-600 bg-yellow-100';
      case 'Not Started':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Preview Projects</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Summary Header */}
          {!loading && !error && projects.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Available for Invoice Creation
                  </h3>
                  <p className="text-sm text-blue-700">
                    {projects.length} project{projects.length !== 1 ? 's' : ''} available for invoice creation
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-blue-900">{projects.length}</div>
                  <div className="text-xs text-blue-600">Available</div>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading projects available for invoice creation...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
              <p className="text-gray-600 text-sm sm:text-base">{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No projects available for invoice creation</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                All projects already have invoices created, or no projects exist. Create a new project to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {projects.map((project) => (
                <div
                  key={project._id || project.id}
                  className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow relative"
                >
                  {/* Available for Invoice Badge */}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Available for Invoice</span>
                      <span className="sm:hidden">Available</span>
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 pr-16 sm:pr-20">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{project.name}</h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">{project.description}</p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">Start: {formatDate(project.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">Due: {formatDate(project.dueDate)}</span>
                        </div>
                        {project.budget && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">Budget: ${project.budget}</span>
                          </div>
                        )}
                        {project.clientId && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">Client: {project.clientId?.name || 'Unknown'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-start sm:justify-end gap-2 sm:ml-4">
                      <Button
                        size="sm"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => handleCreateInvoice(project)}
                        className="w-full sm:w-auto"
                      >
                        <span className="hidden sm:inline">Create Invoice</span>
                        <span className="sm:hidden">Create</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPreviewModal;
