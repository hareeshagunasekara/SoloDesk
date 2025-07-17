import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import AddProjectModal from '../components/AddProjectModal';
import { getAllProjects, createProject } from '../services/projectService';
import { clientService } from '../services/clientService';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import taskService from '../services/taskService';

const Projects = () => {
  const { isAuthenticated, user, checkTokenValidity } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filter state
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [dueDateSort, setDueDateSort] = useState('None');
  const [budgetSort, setBudgetSort] = useState('None');

  // State to hold tasks info for each project
  const [projectTasksInfo, setProjectTasksInfo] = useState({}); // { [projectId]: { completed, total, nextDueDate } }

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

  // Fetch tasks for all projects after loading
  useEffect(() => {
    if (!loading && projects.length > 0) {
      const fetchTasksForProjects = async () => {
        const info = {};
        await Promise.all(projects.map(async (project) => {
          try {
            const res = await taskService.getProjectTasks(project._id);
            if (res.success && Array.isArray(res.data)) {
              const tasks = res.data;
              const completed = tasks.filter(t => t.completed).length;
              const total = tasks.length;
              // Find next due date (soonest in the future)
              const now = new Date();
              const futureTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) >= now);
              let nextDueDate = null;
              if (futureTasks.length > 0) {
                nextDueDate = futureTasks.reduce((soonest, t) => {
                  const tDate = new Date(t.dueDate);
                  return (!soonest || tDate < soonest) ? tDate : soonest;
                }, null);
              }
              info[project._id] = {
                completed,
                total,
                nextDueDate: nextDueDate ? nextDueDate.toISOString() : null
              };
            } else {
              info[project._id] = { completed: 0, total: 0, nextDueDate: null };
            }
          } catch {
            info[project._id] = { completed: 0, total: 0, nextDueDate: null };
          }
        }));
        setProjectTasksInfo(info);
      };
      fetchTasksForProjects();
    }
  }, [loading, projects]);

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
              {/* Filters */}
              <div className="flex gap-2 items-center">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="All">All Statuses</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="border border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {/* Due Date Sort */}
                <select
                  value={dueDateSort}
                  onChange={e => setDueDateSort(e.target.value)}
                  className="border border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                  title="Sort by due date"
                >
                  <option value="None">Sort by Due Date</option>
                  <option value="Closest">Closest First</option>
                  <option value="Farthest">Farthest First</option>
                </select>
                {/* Budget Sort */}
                <select
                  value={budgetSort}
                  onChange={e => setBudgetSort(e.target.value)}
                  className="border border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                  title="Sort by budget"
                >
                  <option value="None">Sort by Budget</option>
                  <option value="Highest">Highest First</option>
                  <option value="Lowest">Lowest First</option>
                </select>
                {(statusFilter !== 'All' || priorityFilter !== 'All' || dueDateSort !== 'None' || budgetSort !== 'None') && (
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 transition-all"
                    style={{ minWidth: 60 }}
                    onClick={() => {
                      setStatusFilter('All');
                      setPriorityFilter('All');
                      setDueDateSort('None');
                      setBudgetSort('None');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Filter projects in-memory */}
              {projects
                .filter(project => {
                  // Status filter
                  if (statusFilter !== 'All' && project.status !== statusFilter) return false;
                  // Priority filter
                  if (priorityFilter !== 'All' && project.priority !== priorityFilter) return false;
                  return true;
                })
                .sort((a, b) => {
                  // Handle budget sorting first (higher priority)
                  if (budgetSort !== 'None') {
                    const aBudget = a.budget || 0;
                    const bBudget = b.budget || 0;
                    if (budgetSort === 'Highest') return bBudget - aBudget;
                    if (budgetSort === 'Lowest') return aBudget - bBudget;
                  }
                  
                  // Handle due date sorting
                  if (dueDateSort !== 'None') {
                    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    if (dueDateSort === 'Closest') return aDue - bDue;
                    if (dueDateSort === 'Farthest') return bDue - aDue;
                  }
                  
                  return 0;
                })
                .map((project) => {
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
                // Get task info from state
                const taskInfo = projectTasksInfo[project._id] || { completed: 0, total: 0, nextDueDate: null };
                const completedTasks = taskInfo.completed;
                const totalTasks = taskInfo.total;
                const nextTaskDue = taskInfo.nextDueDate ? new Date(taskInfo.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No upcoming tasks';
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
                    // estimatedHours removed
                    completedTasks={completedTasks}
                    totalTasks={totalTasks}
                    nextTaskDue={nextTaskDue}
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