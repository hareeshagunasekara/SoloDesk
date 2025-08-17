import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Calendar, Clock, DollarSign, Users, CheckSquare, Edit, Eye, Paperclip, Archive, Zap, FolderOpen, Target, TrendingUp, X } from 'lucide-react';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import taskService from '../services/taskService';
import { Loader2 } from 'lucide-react';
import ViewProject from './ViewProject';
import clientService from '../services/clientService';
import { projectService } from '../services/projectService';

// Helper to get status color using gray theme
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-gray-600 text-white';
    case 'in progress':
      return 'bg-gray-500 text-white';
    case 'pending':
      return 'bg-gray-400 text-white';
    case 'on hold':
      return 'bg-gray-300 text-gray-700';
    case 'cancelled':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

// Helper to get priority color using gray theme
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'text-gray-900 bg-gray-100';
    case 'High':
      return 'text-gray-800 bg-gray-50';
    case 'Medium':
      return 'text-gray-700 bg-gray-50';
    case 'Low':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Helper to get due date badge using gray theme
const getDueBadge = (daysLeft, isOverdue) => {
  if (isOverdue) return <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-900 text-white text-xs font-medium">Overdue</span>;
  if (daysLeft <= 3) return <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-700 text-white text-xs font-medium">{daysLeft}d left</span>;
  if (daysLeft <= 7) return <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-500 text-white text-xs font-medium">{daysLeft}d left</span>;
  return <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-300 text-gray-700 text-xs font-medium">{daysLeft}d left</span>;
};

const ProjectCard = ({
  project,
  clientName,
  tags = [],
  dueDate,
  daysLeft,
  isOverdue,
  progress = 0,
  priority = 'Medium',
  budget,
  estimatedHours,
  completedTasks = 0,
  totalTasks = 0,
  assignedTo = '',
  onView,
  onEdit,
  onArchive,
  onAttach,
  nextTaskDue
}) => {
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [updatingTaskIds, setUpdatingTaskIds] = useState([]);

  // ViewProject modal state and data
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Handler to open ViewProject modal
  const handleOpenView = () => {
    setViewOpen(true);
  };

  // Handler to open ViewProject modal in edit mode
  const handleOpenEdit = () => {
    setEditOpen(true);
  };

  // Fetch tasks when component mounts to calculate progress
  useEffect(() => {
    if (project?._id) {
      setLoadingTasks(true);
      setTasksError(null);
      taskService.getProjectTasks(project._id)
        .then(res => {
          if (res.success) {
            setTasks(res.data);
          } else {
            setTasks([]);
            setTasksError(res.message || 'Failed to fetch tasks');
          }
        })
        .catch(err => {
          setTasks([]);
          setTasksError(err.message || 'Failed to fetch tasks');
        })
        .finally(() => setLoadingTasks(false));
    }
  }, [project?._id]);

  // Fetch tasks when showTasks is toggled on (for display purposes)
  useEffect(() => {
    if (showTasks && project?._id && tasks.length === 0) {
      setLoadingTasks(true);
      setTasksError(null);
      taskService.getProjectTasks(project._id)
        .then(res => {
          if (res.success) {
            setTasks(res.data);
          } else {
            setTasks([]);
            setTasksError(res.message || 'Failed to fetch tasks');
          }
        })
        .catch(err => {
          setTasks([]);
          setTasksError(err.message || 'Failed to fetch tasks');
        })
        .finally(() => setLoadingTasks(false));
    }
  }, [showTasks, project?._id, tasks.length]);

  // Handle checkbox toggle for task completion
  const handleToggleTaskComplete = async (taskId) => {
    setUpdatingTaskIds((prev) => [...prev, taskId]);
    // Optimistically update UI
    setTasks((prevTasks) => prevTasks.map(task =>
      task._id === taskId ? { ...task, completed: !task.completed } : task
    ));
    try {
      const res = await taskService.toggleTaskComplete(taskId);
      if (!res.success) {
        throw new Error(res.message || 'Failed to update task');
      }
    } catch (err) {
      // Revert UI if error
      setTasks((prevTasks) => prevTasks.map(task =>
        task._id === taskId ? { ...task, completed: !task.completed } : task
      ));
      alert(err.message || 'Failed to update task');
    } finally {
      setUpdatingTaskIds((prev) => prev.filter(id => id !== taskId));
    }
  };

  // Calculate progress based on props or project.progress
  const progressPercent = (typeof completedTasks === 'number' && typeof totalTasks === 'number' && totalTasks > 0)
    ? Math.round((completedTasks / totalTasks) * 100)
    : (project?.progress !== undefined ? project.progress : 0);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(priority)}`}>
                  <Zap className="h-3 w-3 mr-1" />
                  {priority}
                </span>
                {clientName && (
                  <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                    {clientName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 ml-3">
              <button
                onClick={handleOpenView}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="View Project"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={handleOpenEdit}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Edit Project"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-medium">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-400 px-2 py-0.5">+{tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Progress</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-600 to-gray-700 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
            <span>{typeof completedTasks === 'number' && typeof totalTasks === 'number' ? `${completedTasks} of ${totalTasks} tasks completed` : 'No tasks'}</span>
            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{dueDate}</span>
                {getDueBadge(daysLeft, isOverdue)}
              </div>
            )}
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Budget</div>
                  <div className="font-medium text-gray-900">{budget}</div>
                </div>
              </div>
            )}
            {nextTaskDue && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Next Task</div>
                  <div className="font-medium text-gray-900">{nextTaskDue}</div>
                </div>
              </div>
            )}
            {assignedTo && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Assigned</div>
                  <div className="font-medium text-gray-900">{assignedTo}</div>
                </div>
              </div>
            )}
            {estimatedHours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Est. Hours</div>
                  <div className="font-medium text-gray-900">{estimatedHours}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowTasks(true)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>Tasks ({totalTasks})</span>
            </div>
            <MdExpandMore className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tasks Preview Modal */}
      {showTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Tasks - {project.name}</h3>
              </div>
              <button
                onClick={() => setShowTasks(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {loadingTasks ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading tasks...
                </div>
              ) : tasksError ? (
                <div className="text-sm text-red-500 py-4">{tasksError}</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No tasks for this project.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task, idx) => (
                    <div key={task._id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          disabled={updatingTaskIds.includes(task._id)}
                          onChange={() => handleToggleTaskComplete(task._id)}
                          className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                        />
                        {updatingTaskIds.includes(task._id) ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <CheckSquare className={`h-4 w-4 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`} />
                        )}
                      </label>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium block ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.name}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {task.priority && (
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ViewProject Modal */}
      {viewOpen && (
        <ViewProject
          isOpen={viewOpen}
          projectId={project._id}
          onClose={() => setViewOpen(false)}
          onEdit={onEdit}
          onDownload={() => alert('Download PDF')}
          onAttach={onAttach}
          onDelete={onArchive}
          onAddTask={() => alert('Add Task')}
          onTaskStatusChange={() => alert('Update Task Status')}
          onTaskExpand={() => alert('Expand Task')}
          onAddAttachment={() => alert('Add Attachment')}
          onDeleteAttachment={() => alert('Delete Attachment')}
          onRenameAttachment={() => alert('Rename Attachment')}
          onAddNote={() => alert('Add Note')}
          onEditNote={() => alert('Edit Note')}
          onDeleteNote={() => alert('Delete Note')}
          onClientClick={() => alert('Open Client Profile')}
        />
      )}
      {/* EditProject Modal */}
      {editOpen && (
        <ViewProject
          isOpen={editOpen}
          projectId={project._id}
          initialEditMode={true}
          initialActiveTab="overview"
          onClose={() => setEditOpen(false)}
          onEdit={onEdit}
          onDownload={() => alert('Download PDF')}
          onAttach={onAttach}
          onDelete={onArchive}
          onAddTask={() => alert('Add Task')}
          onTaskStatusChange={() => alert('Update Task Status')}
          onTaskExpand={() => alert('Expand Task')}
          onAddAttachment={() => alert('Add Attachment')}
          onDeleteAttachment={() => alert('Delete Attachment')}
          onRenameAttachment={() => alert('Rename Attachment')}
          onAddNote={() => alert('Add Note')}
          onEditNote={() => alert('Edit Note')}
          onDeleteNote={() => alert('Delete Note')}
          onClientClick={() => alert('Open Client Profile')}
        />
      )}
    </>
  );
};

export default ProjectCard; 