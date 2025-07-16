import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Calendar, Clock, DollarSign, Users, CheckSquare, Edit, Eye, Paperclip, Archive, Zap } from 'lucide-react';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import taskService from '../services/taskService';
import { Loader2 } from 'lucide-react';

// Helper to get color for priority
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'text-red-600';
    case 'High':
      return 'text-orange-500';
    case 'Medium':
      return 'text-yellow-500';
    case 'Low':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
};

// Helper to get badge color for due date
const getDueBadge = (daysLeft, isOverdue) => {
  if (isOverdue) return <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">🔴 Overdue</span>;
  if (daysLeft <= 3) return <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">{daysLeft} days left</span>;
  return <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{daysLeft} days left</span>;
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
  onAttach
}) => {
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [updatingTaskIds, setUpdatingTaskIds] = useState([]);

  // Fetch tasks when showTasks is toggled on
  useEffect(() => {
    if (showTasks && project?._id) {
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
  }, [showTasks, project?._id]);

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

  // Calculate progress based on tasks
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 space-y-4 transition hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${project.status === 'Completed' ? 'bg-green-100 text-green-800' : project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>{project.status}</span>
          <span className="font-bold text-lg text-gray-900 ml-1.5">{project.name}</span>
        </div>
        <span className="text-sm text-gray-500 font-medium">{clientName}</span>
      </div>
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs mb-1">
          {tags.map((tag, idx) => (
            <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
          ))}
        </div>
      )}
      {/* Middle Section: Due, Progress, Priority, Budget, Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm bg-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-700">Due: <span className="font-semibold text-gray-900">{dueDate}</span></span>
          {getDueBadge(daysLeft, isOverdue)}
        </div>
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-700">{progressPercent}% Done</span>
          <div className="w-24 h-2 ml-2 rounded-full bg-[#e5e7eb] overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #BC96E6 0%, #FFD166 100%)',
                boxShadow: progressPercent > 0 ? '0 0 8px 2px #FFD16688, 0 0 16px 4px #BC96E688' : 'none',
                filter: progressPercent > 0 ? 'brightness(1.1)' : 'none',
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s',
              }}
            ></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${getPriorityColor(priority)}`} />
          <span className={`font-medium ${getPriorityColor(priority)}`}>Priority: {priority}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">Budget: <span className="font-semibold text-gray-900">{budget}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">Estimated: <span className="font-semibold text-gray-900">{estimatedHours}h</span></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">Completed: <span className="font-semibold text-gray-900">{completedTasks}/{totalTasks}</span></span>
          </div>
        </div>
      </div>
      {/* Footer: Assigned to, Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col text-xs text-gray-500 font-medium">
          {assignedTo && <span className="flex items-center gap-1"><Users className="h-3 w-3 text-gray-400" />Assigned: <span className="text-gray-700 font-semibold">{assignedTo}</span></span>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="primary" className="text-white" icon={<Eye className="h-4 w-4" />} onClick={onView}>View</Button>
          <Button size="sm" variant="primary" className="text-white" icon={<Edit className="h-4 w-4" />} onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="primary" className="text-white" icon={<Paperclip className="h-4 w-4" />} onClick={onAttach}>Attachments</Button>
          <Button size="sm" variant="primary" className="text-white" icon={<Archive className="h-4 w-4" />} onClick={onArchive}>Archive</Button>
          <Button
            size="sm"
            variant="primary"
            className="text-white"
            icon={showTasks ? <MdExpandLess className="h-4 w-4" /> : <MdExpandMore className="h-4 w-4" />}
            onClick={() => setShowTasks((prev) => !prev)}
          >
            {showTasks ? 'Collapse' : 'Tasks'}
          </Button>
        </div>
      </div>
      {/* Tasks Preview */}
      {showTasks && (
        <div className="mt-4 bg-gray-100 border border-gray-200 rounded-xl p-4">
          <div className="font-semibold mb-2 text-sm text-gray-700">Tasks Preview</div>
          {loadingTasks ? (
            <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading tasks...</div>
          ) : tasksError ? (
            <div className="text-xs text-red-500">{tasksError}</div>
          ) : tasks.length === 0 ? (
            <div className="text-xs text-gray-400">No tasks for this project.</div>
          ) : (
            <ul className="space-y-2">
              {tasks.slice(0, 5).map((task, idx) => (
                <li key={task._id || idx} className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!task.completed}
                      disabled={updatingTaskIds.includes(task._id)}
                      onChange={() => handleToggleTaskComplete(task._id)}
                      className="accent-green-500 h-3 w-3 rounded border-gray-300 focus:ring-0"
                    />
                    {updatingTaskIds.includes(task._id) ? (
                      <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                    ) : (
                      <CheckSquare className={`h-3 w-3 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    )}
                  </label>
                  <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-700'}>{task.name}</span>
                  {task.dueDate && (
                    <span className="ml-2 text-gray-400">({new Date(task.dueDate).toLocaleDateString()})</span>
                  )}
                </li>
              ))}
              {tasks.length > 5 && (
                <li className="text-xs text-gray-400 italic">...and {tasks.length - 5} more</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCard; 