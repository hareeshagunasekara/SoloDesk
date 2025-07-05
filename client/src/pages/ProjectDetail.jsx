import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectsAPI } from '../services/api';
import { cn, formatDate, formatCurrency } from '../utils/cn';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Clock,
  Users,
  CheckSquare,
  FileText,
  FolderOpen,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();

  const { data: project, isLoading } = useQuery(
    ['project', id],
    () => projectsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  // Mock data for demonstration
  const mockProject = {
    id: id,
    name: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX, responsive design, and improved performance.',
    client: 'TechCorp Solutions',
    status: 'in-progress',
    priority: 'high',
    startDate: '2024-01-01',
    dueDate: '2024-02-15',
    budget: 15000,
    actualCost: 8500,
    estimatedHours: 120,
    actualHours: 68,
    progress: 65,
    tasks: [
      { id: 1, title: 'Design mockups', status: 'completed', progress: 100 },
      { id: 2, title: 'Frontend development', status: 'in-progress', progress: 75 },
      { id: 3, title: 'Backend integration', status: 'pending', progress: 0 },
      { id: 4, title: 'Testing & QA', status: 'pending', progress: 0 },
      { id: 5, title: 'Deployment', status: 'pending', progress: 0 },
    ],
    team: [
      { id: 1, name: 'John Doe', role: 'Project Manager', avatar: null },
      { id: 2, name: 'Jane Smith', role: 'UI/UX Designer', avatar: null },
      { id: 3, name: 'Mike Johnson', role: 'Frontend Developer', avatar: null },
    ],
    notes: 'Client is very particular about the design. Make sure to get approval at each stage before proceeding.',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const projectData = project || mockProject;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'muted';
      case 'overdue':
        return 'error';
      default:
        return 'muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'muted';
    }
  };

  const daysUntilDue = Math.ceil(
    (new Date(projectData.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/projects"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">
              {projectData.name}
            </h1>
            <p className="text-muted-foreground">
              {projectData.client} • Started {formatDate(projectData.startDate, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
            Edit Project
          </Button>
          <Button icon={<CheckSquare className="h-4 w-4" />}>
            Complete Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Overview</h3>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground mb-6">
                {projectData.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    {projectData.progress}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    {projectData.tasks.filter(t => t.status === 'completed').length}/{projectData.tasks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    {projectData.actualHours}h
                  </div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    {daysUntilDue > 0 ? daysUntilDue : 'Overdue'}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Left</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tasks</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {projectData.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        `bg-${getStatusColor(task.status)}`
                      )} />
                      <div>
                        <p className="font-medium text-card-foreground">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.progress}% complete
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      `bg-${getStatusColor(task.status)}/10 text-${getStatusColor(task.status)}`
                    )}>
                      {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Notes</h3>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">
                {projectData.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Status</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  `bg-${getStatusColor(projectData.status)}/10 text-${getStatusColor(projectData.status)}`
                )}>
                  {projectData.status}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <div className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  `bg-${getPriorityColor(projectData.priority)}/10 text-${getPriorityColor(projectData.priority)}`
                )}>
                  {projectData.priority}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className="text-sm font-medium text-card-foreground">
                  {formatDate(projectData.dueDate, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Budget & Time */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Budget & Time</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Budget</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {formatCurrency(projectData.budget)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Spent</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {formatCurrency(projectData.actualCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Estimated</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {projectData.estimatedHours}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Actual</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {projectData.actualHours}h
                </span>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Team</h3>
            </div>
            <div className="card-content space-y-3">
              {projectData.team.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-sm font-semibold text-accent-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content space-y-3">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<CheckSquare className="h-4 w-4" />}
                iconPosition="left"
              >
                Add Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Clock className="h-4 w-4" />}
                iconPosition="left"
              >
                Start Timer
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<FileText className="h-4 w-4" />}
                iconPosition="left"
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 