import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import AddProjectModal from '../components/AddProjectModal';
import { getAllProjects, createProject } from '../services/projectService';
import { clientService } from '../services/clientService';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';

const Projects = () => {
  const { isAuthenticated, user, checkTokenValidity } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects and clients on component mount
  useEffect(() => {
    if (isAuthenticated && user && checkTokenValidity()) {
      fetchData();
    } else if (!isAuthenticated) {
      setLoading(false);
    } else if (!checkTokenValidity()) {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch data...');
      
      const [projectsData, clientsData] = await Promise.all([
        getAllProjects(),
        clientService.getClients()
      ]);
      
      console.log('Projects data:', projectsData);
      console.log('Clients data:', clientsData);
      
      // Handle both direct response and nested data structure for projects
      const projectsArray = Array.isArray(projectsData.data) ? projectsData.data : 
                           Array.isArray(projectsData) ? projectsData : [];
      
      // Handle clients data structure (similar to Clients.jsx)
      const clientsArray = clientsData.data?.data || clientsData.data || [];
      
      console.log('Projects array:', projectsArray);
      console.log('Clients array:', clientsArray);
      
      setProjects(projectsArray);
      setClients(clientsArray);
    } catch (err) {
      console.error('Error fetching data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        setError('Please log in to access this page');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        setError('Failed to fetch data. Please try again.');
      }
      
      // Set empty arrays as fallback
      setProjects([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      console.log('Creating project with data:', projectData);
      const result = await createProject(projectData);
      console.log('Project created successfully:', result);
      
      // Refresh both projects and clients lists
      const [updatedProjects, updatedClients] = await Promise.all([
        getAllProjects(),
        clientService.getClients()
      ]);
      
      setProjects(updatedProjects.data || []);
      setClients(updatedClients.data?.data || updatedClients.data || []);
      
      return result;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track their progress
          </p>
        </div>
        <Button 
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            if (!isAuthenticated || !checkTokenValidity()) {
              alert('Please log in to create a project');
              window.location.href = '/login';
              return;
            }
            setIsAddModalOpen(true);
          }}
        >
          New Project
        </Button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="input pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" icon={<Filter className="h-4 w-4" />}>
                Filter
              </Button>
            </div>
          </div>
        </div>
        <div className="card-content">
          {loading ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error loading projects
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                No projects found
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first project to organize your work.
              </p>
              <Button 
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  if (!isAuthenticated || !checkTokenValidity()) {
                    alert('Please log in to create a project');
                    window.location.href = '/login';
                    return;
                  }
                  setIsAddModalOpen(true);
                }}
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                // Calculate derived fields for ProjectCard
                const clientName = project.clientId?.name || 'No client assigned';
                const tags = project.tags || [];
                const dueDateObj = project.dueDate ? new Date(project.dueDate) : null;
                const today = new Date();
                const daysLeft = dueDateObj ? Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24)) : null;
                const isOverdue = dueDateObj ? (today > dueDateObj && project.status !== 'Completed') : false;
                const progress = project.progress || 0;
                const priority = project.priority || 'Medium';
                const budget = project.budget ? `LKR ${project.budget.toLocaleString()}` : 'N/A';
                const estimatedHours = project.estimatedHours || 0;
                const completedTasks = project.completedTasks || 0;
                const totalTasks = project.totalTasks || 0;
                const createdBy = project.createdBy?.firstName ? `${project.createdBy.firstName} ${project.createdBy.lastName || ''}` : 'You';
                const assignedTo = project.assignedTo?.firstName ? `${project.assignedTo.firstName} ${project.assignedTo.lastName || ''}` : '';
                return (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    clientName={clientName}
                    tags={tags}
                    dueDate={dueDateObj ? dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    daysLeft={daysLeft}
                    isOverdue={isOverdue}
                    progress={progress}
                    priority={priority}
                    budget={budget}
                    estimatedHours={estimatedHours}
                    completedTasks={completedTasks}
                    totalTasks={totalTasks}
                    createdBy={createdBy}
                    assignedTo={assignedTo}
                    onView={() => { /* TODO: handle view */ }}
                    onEdit={() => { /* TODO: handle edit */ }}
                    onArchive={() => { /* TODO: handle archive */ }}
                    onAttach={() => { /* TODO: handle attachments */ }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProject}
        clients={clients}
      />
    </div>
  );
};

export default Projects; 