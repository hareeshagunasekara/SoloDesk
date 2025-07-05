import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { tasksAPI } from '../services/api';
import { cn, formatDate, formatCurrency } from '../utils/cn';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  User,
  CheckSquare,
  MessageSquare,
  FileText,
  AlertCircle,
} from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();

  const { data: task, isLoading } = useQuery(
    ['task', id],
    () => tasksAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  // Mock data for demonstration
  const mockTask = {
    id: id,
    title: 'Design Homepage Mockups',
    description: 'Create modern, responsive homepage mockups for the new website design. Include mobile and desktop versions.',
    project: 'Website Redesign',
    client: 'TechCorp Solutions',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Jane Smith',
    createdBy: 'John Doe',
    dueDate: '2024-01-20',
    estimatedHours: 8,
    actualHours: 5.5,
    progress: 70,
    tags: ['Design', 'UI/UX', 'Frontend'],
    comments: [
      {
        id: 1,
        author: 'John Doe',
        content: 'Please make sure to follow the brand guidelines.',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        id: 2,
        author: 'Jane Smith',
        content: 'Working on the mobile version now. Will have it ready by tomorrow.',
        timestamp: '2024-01-16T14:20:00Z',
      },
    ],
    attachments: [
      { id: 1, name: 'brand-guidelines.pdf', size: '2.3 MB' },
      { id: 2, name: 'wireframes.sketch', size: '1.8 MB' },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const taskData = task || mockTask;

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
    (new Date(taskData.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/tasks"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">
              {taskData.title}
            </h1>
            <p className="text-muted-foreground">
              {taskData.project} • {taskData.client}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
            Edit Task
          </Button>
          <Button icon={<CheckSquare className="h-4 w-4" />}>
            Complete Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Description</h3>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">
                {taskData.description}
              </p>
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Comments</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {taskData.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-accent-foreground">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-card-foreground">
                          {comment.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.timestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex space-x-3 pt-4">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-accent-foreground">
                      YO
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Add a comment..."
                      className="textarea w-full"
                      rows={3}
                    />
                    <div className="mt-2">
                      <Button size="sm">Add Comment</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Attachments</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {taskData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" icon={<FileText className="h-4 w-4" />}>
                  Add Attachment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Task Status</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  `bg-${getStatusColor(taskData.status)}/10 text-${getStatusColor(taskData.status)}`
                )}>
                  {taskData.status}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <div className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  `bg-${getPriorityColor(taskData.priority)}/10 text-${getPriorityColor(taskData.priority)}`
                )}>
                  {taskData.priority}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium text-card-foreground">
                  {taskData.progress}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className={cn(
                  'text-sm font-medium',
                  daysUntilDue <= 3 ? 'text-error' : 'text-card-foreground'
                )}>
                  {formatDate(taskData.dueDate, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Assignment & Time */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Assignment & Time</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Assignee</span>
                </div>
                <span className="text-sm font-medium text-card-foreground">
                  {taskData.assignee}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created by</span>
                </div>
                <span className="text-sm font-medium text-card-foreground">
                  {taskData.createdBy}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Estimated</span>
                </div>
                <span className="text-sm font-medium text-card-foreground">
                  {taskData.estimatedHours}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Actual</span>
                </div>
                <span className="text-sm font-medium text-card-foreground">
                  {taskData.actualHours}h
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tags</h3>
            </div>
            <div className="card-content">
              <div className="flex flex-wrap gap-2">
                {taskData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
                icon={<Clock className="h-4 w-4" />}
                iconPosition="left"
              >
                Start Timer
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<MessageSquare className="h-4 w-4" />}
                iconPosition="left"
              >
                Add Comment
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<FileText className="h-4 w-4" />}
                iconPosition="left"
              >
                Add Attachment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 