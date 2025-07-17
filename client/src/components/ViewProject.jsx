import React, { useState, useEffect } from 'react';
import { X, Edit, Download, Paperclip, Trash2, Calendar, Clock, CheckCircle, Link2, File, FileImage, FileText, FileArchive, FileVideo, FileAudio, Plus, ExternalLink, User, Building2, Mail, Phone, MapPin, Globe, Tag, DollarSign, FolderOpen, MessageSquare } from 'lucide-react';
import { projectService } from '../services/projectService';
import clientService from '../services/clientService';
import taskService from '../services/taskService';
import ClientProfile from './ClientProfile';

// Add CSS animation for progress bar
const progressAnimation = `
  @keyframes progressFill {
    from { width: 0%; }
    to { width: var(--progress-width); }
  }
`;

// Inject the CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = progressAnimation;
  document.head.appendChild(style);
}

const getFileIcon = (mimeType, name) => {
  if (mimeType?.startsWith('image/')) return <FileImage className="h-4 w-4 text-gray-400" />;
  if (mimeType?.startsWith('video/')) return <FileVideo className="h-4 w-4 text-gray-400" />;
  if (mimeType?.startsWith('audio/')) return <FileAudio className="h-4 w-4 text-gray-400" />;
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar') || name?.endsWith('.zip')) return <FileArchive className="h-4 w-4 text-gray-400" />;
  if (mimeType?.includes('pdf') || name?.endsWith('.pdf')) return <FileText className="h-4 w-4 text-gray-400" />;
  return <File className="h-4 w-4 text-gray-400" />;
};

const statusColor = (status) => {
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

const statusPill = (status) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(status)}`}>
    {status || 'Unknown'}
  </span>
);

const SectionHeader = ({ icon, title, children }) => (
  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
    {icon}
    <h3 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
    {children}
  </div>
);

// Change props: accept projectId and onClose, onEdit, etc. (no project, client, tasks, ...)
const ViewProject = ({ 
  isOpen, 
  projectId, 
  onClose, 
  onEdit, 
  onDownload, 
  onAttach, 
  onDelete, 
  onAddTask, 
  onTaskStatusChange, 
  onTaskExpand, 
  onAddAttachment, 
  onDeleteAttachment, 
  onRenameAttachment, 
  onAddNote, 
  onEditNote, 
  onDeleteNote, 
  onClientClick,
  initialEditMode = false,
  initialActiveTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState([]);
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    status: '',
    priority: '',
    clientId: ''
  });
  const [saving, setSaving] = useState(false);
  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  // All clients for dropdown
  const [allClients, setAllClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskForm, setAddTaskForm] = useState({
    name: '',
    dueDate: '',
    priority: 'Medium',
  });
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [addTaskError, setAddTaskError] = useState('');
  const [isTaskEditMode, setIsTaskEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskForm, setEditingTaskForm] = useState({ name: '', dueDate: '', priority: 'Medium' });
  const [editingTaskLoading, setEditingTaskLoading] = useState(false);
  const [editingTaskError, setEditingTaskError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  // Add state for new note
  const [newNote, setNewNote] = useState('');
  const [addNoteLoading, setAddNoteLoading] = useState(false);
  const [addNoteError, setAddNoteError] = useState('');
  // Add state for note deletion
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  // Add state for note deletion confirmation dialog
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  // Add state for project deletion confirmation dialog
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  // Add state for ClientProfile modal
  const [showClientProfile, setShowClientProfile] = useState(false);

  const handleOpenAddTask = () => {
    setAddTaskForm({ name: '', dueDate: '', priority: 'Medium' });
    setAddTaskError('');
    setShowAddTaskModal(true);
  };
  const handleCloseAddTask = () => {
    setShowAddTaskModal(false);
  };
  const handleAddTaskInputChange = (field, value) => {
    setAddTaskForm(prev => ({ ...prev, [field]: value }));
  };
  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    setAddTaskLoading(true);
    setAddTaskError('');
    try {
      if (!addTaskForm.name.trim()) {
        setAddTaskError('Task name is required');
        setAddTaskLoading(false);
        return;
      }
      const newTask = {
        name: addTaskForm.name,
        dueDate: addTaskForm.dueDate ? new Date(addTaskForm.dueDate).toISOString() : undefined,
        priority: addTaskForm.priority,
        projectId: projectId,
      };
      const result = await taskService.createTask(newTask);
      if (result.success && result.data) {
        setTasks(prev => [...prev, result.data]);
        setShowAddTaskModal(false);
      } else {
        setAddTaskError(result.message || 'Failed to add task');
      }
    } catch (err) {
      setAddTaskError('Failed to add task');
    } finally {
      setAddTaskLoading(false);
    }
  };

  const handleEditTasksClick = () => {
    setIsTaskEditMode(true);
    setEditingTaskId(null);
  };
  const handleCancelEditTasks = () => {
    setIsTaskEditMode(false);
    setEditingTaskId(null);
    setEditingTaskError('');
  };
  const handleEditTaskRow = (task) => {
    setEditingTaskId(task._id);
    setEditingTaskForm({
      name: task.name || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'Medium',
    });
    setEditingTaskError('');
  };
  const handleEditTaskInputChange = (field, value) => {
    setEditingTaskForm(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveEditTask = async (taskId) => {
    setEditingTaskLoading(true);
    setEditingTaskError('');
    try {
      if (!editingTaskForm.name.trim()) {
        setEditingTaskError('Task name is required');
        setEditingTaskLoading(false);
        return;
      }
      const updateData = {
        name: editingTaskForm.name,
        dueDate: editingTaskForm.dueDate ? new Date(editingTaskForm.dueDate).toISOString() : undefined,
        priority: editingTaskForm.priority,
      };
      const result = await taskService.updateTask(taskId, updateData);
      if (result.success && result.data) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...result.data } : t));
        setEditingTaskId(null);
      } else {
        setEditingTaskError(result.message || 'Failed to update task');
      }
    } catch (err) {
      setEditingTaskError('Failed to update task');
    } finally {
      setEditingTaskLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setAddNoteError('');
    if (!newNote.trim()) {
      setAddNoteError('Note content is required');
      return;
    }
    setAddNoteLoading(true);
    try {
      const result = await projectService.addProjectNote(projectId, newNote);
      if (result && result.success && result.data) {
        setNotes(prev => [...prev, result.data]);
        setNewNote('');
      } else {
        setAddNoteError(result.message || 'Failed to add note');
      }
    } catch (err) {
      setAddNoteError(err.message || 'Failed to add note');
    } finally {
      setAddNoteLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const note = notes.find(n => n._id === noteId);
    setNoteToDelete(note);
    setShowDeleteNoteDialog(true);
  };

  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;
    setDeletingNoteId(noteToDelete._id);
    try {
      const result = await projectService.deleteProjectNote(projectId, noteToDelete._id);
      if (result && result.success) {
        setNotes(prev => prev.filter(note => note._id !== noteToDelete._id));
        setSnackbarMessage('Note deleted successfully');
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        alert(result.message || 'Failed to delete note');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    } finally {
      setDeletingNoteId(null);
      setShowDeleteNoteDialog(false);
      setNoteToDelete(null);
    }
  };

  // Handle delete project button click
  const handleDeleteProjectClick = () => {
    setShowDeleteProjectDialog(true);
  };

  // Handle confirm delete project
  const handleConfirmDeleteProject = async () => {
    if (!projectId) return;
    
    setDeletingProject(true);
    try {
      const result = await projectService.deleteProject(projectId);
      if (result.success) {
        setSnackbarMessage('Project deleted successfully');
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
        // Close the modal and notify parent component
        onClose();
        if (onDelete) {
          onDelete(projectId);
        }
      } else {
        alert(`Failed to delete project: ${result.message}`);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProject(false);
      setShowDeleteProjectDialog(false);
    }
  };

  // Handle opening ClientProfile modal
  const handleOpenClientProfile = () => {
    if (client) {
      setShowClientProfile(true);
    }
  };

  // Reset state when modal opens with new props
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialActiveTab);
      setIsEditMode(initialEditMode);
    }
  }, [isOpen, initialActiveTab, initialEditMode]);

  // Fetch all clients for dropdown
  useEffect(() => {
    if (isEditMode) {
      setLoadingClients(true);
      (async () => {
        try {
          console.log('Fetching clients for dropdown...');
          const res = await clientService.getClients();
          console.log('Clients response:', res);
          // Fix: Extract clients from the correct nested structure
          const clientsData = res.data?.data || res.data || [];
          const arr = Array.isArray(clientsData) ? clientsData : [];
          setAllClients(arr);
          console.log('Set allClients:', arr);
        } catch (err) {
          console.error('Error fetching clients:', err);
          setAllClients([]);
        } finally {
          setLoadingClients(false);
        }
      })();
    }
  }, [isEditMode]);

  // Calculate progress percentage (moved up to avoid conditional hook calls)
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Set CSS variable for progress animation (moved to top level)
  useEffect(() => {
    document.documentElement.style.setProperty('--progress-width', `${progress}%`);
  }, [progress]);

  // Populate edit form when project data is loaded
  useEffect(() => {
    if (project) {
      console.log('Populating edit form with project:', project);
      console.log('Project clientId:', project.clientId);
      console.log('Client object:', client);
      
      setEditForm({
        name: project.name || '',
        description: project.description || '',
        budget: project.budget || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
        status: project.status || '',
        priority: project.priority || '',
        clientId: typeof project.clientId === 'object' ? project.clientId._id : (project.clientId || '')
      });
    }
  }, [project, client]);

  // Edit handlers
  const handleEditClick = () => {
    setIsEditMode(true);
    setShowSnackbar(false);
    setSnackbarMessage('');
  };

  const handleSaveProject = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...editForm,
        budget: editForm.budget ? parseFloat(editForm.budget) : null,
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : null,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : null,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null
      };

      const response = await projectService.updateProject(projectId, updatedData);
      
      if (response.success) {
        // Update local project state
        setProject(response.data || response);
        setIsEditMode(false);
        // Call the parent onEdit callback if provided
        if (onEdit) onEdit(response.data || response);
        setSnackbarMessage('Project updated successfully');
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        setError('Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form to current project data
    if (project) {
      setEditForm({
        name: project.name || '',
        description: project.description || '',
        budget: project.budget || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
        status: project.status || '',
        priority: project.priority || '',
        clientId: typeof project.clientId === 'object' ? project.clientId._id : (project.clientId || '')
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (!isOpen || !projectId) return;
    setLoading(true);
    setError(null);
    // Fetch project, then client, tasks, etc.
    (async () => {
      try {
        // 1. Fetch project
        const projResponse = await projectService.getProjectById(projectId);
        console.log('Project response:', projResponse);
        
        // Extract project data from the response structure
        const proj = projResponse.data?.project || projResponse.data || projResponse;
        setProject(proj);
        setAttachments(proj.attachments || []);
        setLinks(proj.links || []); // If links are not in model, leave as []
        setNotes(proj.notes || []); // If notes are not in model, leave as []
        
        // 2. Fetch client
        if (proj.clientId) {
          console.log('Client ID from project:', proj.clientId);
          
          // Check if clientId is already a populated object or just an ID
          if (typeof proj.clientId === 'object' && proj.clientId._id) {
            // Already populated client object
            setClient(proj.clientId);
          } else {
            // Just an ID, need to fetch client
            const clientRes = await clientService.getClient(proj.clientId);
            console.log('Client response:', clientRes);
            
            // Extract client data from the response structure
            const cli = clientRes.data || clientRes;
            setClient(cli);
          }
        } else {
          setClient(null);
        }
        
        // 3. Fetch tasks (or use from project response if available)
        if (projResponse.data?.tasks) {
          setTasks(projResponse.data.tasks);
        } else {
          const taskRes = await taskService.getProjectTasks(projectId);
          setTasks(taskRes.success ? taskRes.data : []);
        }
      } catch (err) {
        console.error('Error loading project details:', err);
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, projectId]);

  // If not open, don't render
  if (!isOpen) return null;

  // Loading and error states
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl h-[98vh] sm:h-[90vh] flex flex-col items-center justify-center border border-gray-300">
          <div className="text-lg text-gray-700">Loading project details...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl h-[98vh] sm:h-[90vh] flex flex-col items-center justify-center border border-gray-300">
          <div className="text-lg text-gray-600">{error}</div>
          <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-800 text-white rounded-lg">Close</button>
        </div>
      </div>
    );
  }
  if (!project) return null;

  // Timeline calculations
  const start = project?.startDate ? new Date(project.startDate) : null;
  const end = project?.endDate ? new Date(project.endDate) : null;
  const due = project?.dueDate ? new Date(project.dueDate) : null;
  const duration = start && end ? Math.ceil((end - start) / (1000 * 60 * 60 * 24)) : null;

  // Calculate dates

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderOpen },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'attachments', label: 'Files', icon: Paperclip },
    { id: 'links', label: 'Links', icon: Link2 },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  // Before rendering tasks in the table, sort them by due date (earliest first):
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl h-[98vh] sm:h-[90vh] flex flex-col border border-gray-300">
        {/* iOS Style Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-4 bg-gray-50 border-b border-gray-300 flex-shrink-0 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Project Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left Sidebar - Project Info */}
          <div className="w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-300 flex flex-col min-h-0 max-h-[60vh] lg:max-h-none lg:rounded-br-xl lg:rounded-br-2xl">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Project Avatar & Basic Info */}
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <span className="text-lg sm:text-2xl font-bold text-gray-700">
                    {project?.name 
                      ? project.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : 'P'
                    }
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  {project?.name || 'Unknown Project'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  {client?.name || 'No Client Assigned'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {statusPill(project?.status)}
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                    {project?.priority || 'No Priority'}
                  </span>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Project Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Start Date</p>
                      <p className="text-xs sm:text-sm text-gray-900">
                        {start ? start.toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
                      <p className="text-xs sm:text-sm text-gray-900">
                        {due ? due.toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">End Date</p>
                      <p className="text-xs sm:text-sm text-gray-900">
                        {end ? end.toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                      <p className="text-xs sm:text-sm text-gray-900">
                        {project?.budget ? `LKR ${project.budget.toLocaleString()}` : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                      <p className="text-xs sm:text-sm text-gray-900">
                        {duration ? `${duration} days` : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quick Stats</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="text-xs sm:text-sm text-gray-600">Progress</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {progress}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Tasks</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-300">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Files</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {attachments.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Quick Actions */}
            <div className="p-3 sm:p-6 border-t border-gray-300 bg-gray-50 lg:rounded-br-xl lg:rounded-br-2xl">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quick Actions</h4>
                
                {activeTab === 'tasks' ? (
                  <button
                    onClick={isTaskEditMode ? handleCancelEditTasks : handleEditTasksClick}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    {isTaskEditMode ? 'Cancel Edit' : 'Edit Tasks'}
                  </button>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Project
                  </button>
                )}
                
                <button
                  onClick={onDownload}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Summary
                </button>
                
                <button
                  onClick={handleDeleteProjectClick}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-2 sm:p-4 bg-white border-b border-gray-300 overflow-x-auto flex-shrink-0 lg:rounded-tr-xl lg:rounded-tr-2xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gray-800 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Overview</h3>
                    </div>
                  </div>

                  {/* Progress Bar - First Priority */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-300 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">Progress</h4>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">{progress}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 font-medium">Completion</span>
                        <span className="text-gray-900 font-semibold">{completedTasks} of {totalTasks} tasks completed</span>
                      </div>
                      
                      <div className="relative w-full h-4 sm:h-5 bg-gray-200 rounded-full shadow-inner">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ 
                            width: '0%',
                            animation: 'progressFill 1.5s ease-out forwards'
                          }}
                        ></div>
                        <div 
                          className="absolute top-0 left-0 h-full bg-gray-500 rounded-full opacity-30 animate-pulse"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Project Information */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <FolderOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Project Information</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Project Name</label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                              placeholder="Enter project name"
                            />
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              <span className="text-xs sm:text-sm text-gray-900">{project?.name || 'No name'}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Client</label>
                          {isEditMode ? (
                            <select
                              value={editForm.clientId}
                              onChange={(e) => handleInputChange('clientId', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            >
                              <option value="">Select a client</option>
                              {/* You can populate this with available clients */}
                              {loadingClients ? (
                                <option value="">Loading clients...</option>
                              ) : (
                                Array.isArray(allClients) && allClients.map(cli => (
                                  <option key={cli._id} value={cli._id}>{cli.name}</option>
                                ))
                              )}
                            </select>
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              <button 
                                className="text-xs sm:text-sm text-gray-600 hover:underline hover:text-gray-800 transition-colors"
                                onClick={handleOpenClientProfile}
                                disabled={!client}
                              >
                                {client?.name || 'No client assigned'}
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
                          {isEditMode ? (
                            <select
                              value={editForm.status}
                              onChange={(e) => handleInputChange('status', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            >
                              <option value="">Select status</option>
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="On Hold">On Hold</option>
                              <option value="Completed">Completed</option>
                            </select>
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              {statusPill(project?.status)}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Priority</label>
                          {isEditMode ? (
                            <select
                              value={editForm.priority}
                              onChange={(e) => handleInputChange('priority', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            >
                              <option value="">Select priority</option>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              <span className="text-xs sm:text-sm text-gray-900">{project?.priority || 'Not set'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Budget</label>
                          {isEditMode ? (
                            <input
                              type="number"
                              value={editForm.budget}
                              onChange={(e) => handleInputChange('budget', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                              placeholder="Enter budget amount"
                            />
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {project?.budget ? `LKR ${project.budget.toLocaleString()}` : 'Not set'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          {isEditMode ? (
                            <input
                              type="date"
                              value={editForm.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            />
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {start ? start.toLocaleDateString() : 'Not set'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Due Date</label>
                          {isEditMode ? (
                            <input
                              type="date"
                              value={editForm.dueDate}
                              onChange={(e) => handleInputChange('dueDate', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            />
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {due ? due.toLocaleDateString() : 'Not set'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">End Date</label>
                          {isEditMode ? (
                            <input
                              type="date"
                              value={editForm.endDate}
                              onChange={(e) => handleInputChange('endDate', e.target.value)}
                              className="w-full p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            />
                          ) : (
                            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {end ? end.toLocaleDateString() : 'Not set'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Description</h4>
                    </div>
                    {isEditMode ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full p-3 bg-white rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                        rows={4}
                        placeholder="Enter project description..."
                      />
                    ) : (
                      <div className="text-sm text-gray-600 whitespace-pre-line">
                        {project?.description || 'No description provided.'}
                      </div>
                    )}
                  </div>

                  {/* Edit Mode Actions */}
                  {isEditMode && (
                    <div className="flex items-center gap-3 pt-4">
                      <button
                        onClick={handleSaveProject}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Project Tasks</h3>
                    </div>
                    <button
                      onClick={handleOpenAddTask}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Task
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-300">
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-fixed">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-1/4 max-w-[180px] truncate px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                            <th className="w-1/5 max-w-[120px] truncate px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="w-1/6 max-w-[100px] truncate px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="w-1/6 max-w-[100px] truncate px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="w-1/12 max-w-[60px] px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedTasks.length > 0 ? (
                            sortedTasks.map(task => (
                              isTaskEditMode && editingTaskId === task._id ? (
                                <tr key={task._id} className="hover:bg-gray-50">
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={editingTaskForm.name}
                                      onChange={e => handleEditTaskInputChange('name', e.target.value)}
                                      className="w-full max-w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 truncate"
                                      required
                                    />
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                    <input
                                      type="date"
                                      value={editingTaskForm.dueDate}
                                      onChange={e => handleEditTaskInputChange('dueDate', e.target.value)}
                                      className="w-full max-w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                    />
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <select
                                      value={editingTaskForm.priority}
                                      onChange={e => handleEditTaskInputChange('priority', e.target.value)}
                                      className="w-full max-w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                    >
                                      <option value="Low">Low</option>
                                      <option value="Medium">Medium</option>
                                      <option value="High">High</option>
                                      <option value="Urgent">Urgent</option>
                                    </select>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      editingTaskForm.priority === 'High' ? 'bg-red-100 text-red-700' :
                                      editingTaskForm.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      editingTaskForm.priority === 'Low' ? 'bg-green-100 text-green-700' :
                                      editingTaskForm.priority === 'Urgent' ? 'bg-red-200 text-red-800' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {editingTaskForm.priority || 'Medium'}
                                    </span>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium flex gap-2">
                                    <button
                                      onClick={() => handleSaveEditTask(task._id)}
                                      className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium disabled:bg-gray-400"
                                      disabled={editingTaskLoading}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingTaskId(null)}
                                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
                                      disabled={editingTaskLoading}
                                    >
                                      Cancel
                                    </button>
                                  </td>
                                </tr>
                              ) : (
                                <tr key={task._id} className="hover:bg-gray-50">
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={task.completed || false}
                                        onChange={async () => {
                                          try {
                                            const result = await taskService.toggleTaskComplete(task._id);
                                            if (result.success) {
                                              setTasks(prevTasks => 
                                                prevTasks.map(t => 
                                                  t._id === task._id 
                                                    ? { ...t, completed: !t.completed }
                                                    : t
                                                )
                                              );
                                            }
                                          } catch (err) {
                                            console.error('Error toggling task:', err);
                                          }
                                        }}
                                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-3"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <span className={`text-xs sm:text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                          {task.name || 'Untitled Task'}
                                        </span>
                                        {task.description && (
                                          <p className="text-xs text-gray-500 truncate mt-1">
                                            {task.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                    {task.dueDate ? (
                                      <div>
                                        <div className={task.isOverdue && !task.completed ? 'text-red-600 font-medium' : ''}>
                                          {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                        {task.daysUntilDue !== null && !task.completed && (
                                          <div className={`text-xs ${task.daysUntilDue < 0 ? 'text-red-500' : task.daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                            {task.daysUntilDue < 0 ? `${Math.abs(task.daysUntilDue)} days overdue` : 
                                             task.daysUntilDue === 0 ? 'Due today' : 
                                             task.daysUntilDue === 1 ? 'Due tomorrow' : 
                                             `${task.daysUntilDue} days left`}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">No due date</span>
                                    )}
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      task.priority === 'Low' ? 'bg-green-100 text-green-700' :
                                      task.priority === 'Urgent' ? 'bg-red-200 text-red-800' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {task.priority || 'Medium'}
                                    </span>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      task.completed ? 'bg-green-100 text-green-700' :
                                      task.isOverdue ? 'bg-red-100 text-red-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {task.completed ? 'Completed' : 
                                       task.isOverdue ? 'Overdue' : 'In Progress'}
                                    </span>
                                  </td>
                                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                                    <button
                                      onClick={() => handleEditTaskRow(task)}
                                      className="text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Edit task"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setTaskToDelete(task);
                                        setShowDeleteDialog(true);
                                      }}
                                      className="text-gray-400 hover:text-red-600 transition-colors"
                                      title="Delete task"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              )
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-3 sm:px-6 py-8 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                  <CheckCircle className="h-12 w-12 text-gray-300 mb-4" />
                                  <p className="text-sm">No tasks found for this project</p>
                                  <button
                                    onClick={onAddTask}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add First Task
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Project Files</h3>
                    </div>
                    <button
                      onClick={onAddAttachment}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add File
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-300">
                    {attachments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
                        {attachments.map((att, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-300 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getFileIcon(att.mimeType, att.name)}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{att.name}</p>
                                  <p className="text-xs text-gray-500">{att.size}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {att.previewUrl && (
                                <a href={att.previewUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                              <a href={att.url} download className="text-gray-600 hover:text-gray-800">
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => onDeleteAttachment(att._id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm text-gray-500">No files attached to this project</p>
                        <button
                          onClick={onAddAttachment}
                          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors mx-auto"
                        >
                          <Plus className="h-4 w-4" />
                          Add First File
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-400 bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                  </div>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Link2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Project Links</h3>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                      Add Link
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {links.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        No links added yet.
                      </div>
                    ) : (
                      links.map(link => (
                        <div key={link._id || link.url} className="p-3 sm:p-4 bg-white rounded-xl border border-gray-300 hover:shadow-sm transition-shadow">
                          <div className="flex items-start gap-3">
                            <Link2 className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs sm:text-sm text-gray-900 mb-1">
                                {link.title || 'Untitled Link'}
                              </div>
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 break-all"
                              >
                                {link.url}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Project Notes</h3>
                    </div>
                  </div>
                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2 items-stretch mb-4">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      className="flex-1 p-2 sm:p-3 bg-white rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                      rows={2}
                      placeholder="Add a note to this project..."
                      disabled={addNoteLoading}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium text-sm disabled:bg-gray-400"
                      disabled={addNoteLoading}
                    >
                      {addNoteLoading ? 'Adding...' : 'Add Note'}
                    </button>
                  </form>
                  {addNoteError && <div className="text-xs text-red-600 mb-2">{addNoteError}</div>}
                  <div className="bg-white rounded-xl border border-gray-300">
                    {notes.length > 0 ? (
                      <div className="space-y-4 p-4 sm:p-6">
                        {notes.map((note, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-300">
                            <div className="flex items-start justify-between mb-3">
                              <div className="text-xs sm:text-sm text-gray-600 mb-2">
                                {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'}
                              </div>
                              <button
                                onClick={() => handleDeleteNote(note._id)}
                                disabled={deletingNoteId === note._id}
                                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Delete note"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-sm text-gray-900 whitespace-pre-line">
                              {note.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm text-gray-500">No notes added to this project</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {snackbarMessage}
        </div>
      )}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add Task</h3>
            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Task Name</label>
                <input
                  type="text"
                  value={addTaskForm.name}
                  onChange={e => handleAddTaskInputChange('name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Enter task name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={addTaskForm.dueDate}
                  onChange={e => handleAddTaskInputChange('dueDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={addTaskForm.priority}
                  onChange={e => handleAddTaskInputChange('priority', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              {addTaskError && <div className="text-xs text-red-600">{addTaskError}</div>}
              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCloseAddTask}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                  disabled={addTaskLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium disabled:bg-gray-400"
                  disabled={addTaskLoading}
                >
                  {addTaskLoading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs sm:max-w-sm flex flex-col items-center">
            <Trash2 className="h-10 w-10 text-red-500 mb-2" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">Delete Task?</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">Are you sure you want to delete <span className="font-medium text-gray-900">{taskToDelete?.name}</span>? This action cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={async () => {
                  if (!taskToDelete) return;
                  try {
                    const result = await taskService.deleteTask(taskToDelete._id);
                    if (result.success) {
                      setTasks(prevTasks => prevTasks.filter(t => t._id !== taskToDelete._id));
                      setSnackbarMessage('Task deleted successfully');
                      setShowSnackbar(true);
                      setTimeout(() => setShowSnackbar(false), 3000);
                    } else {
                      alert(`Failed to delete task: ${result.message}`);
                    }
                  } catch (err) {
                    console.error('Error deleting task:', err);
                    alert('Failed to delete task. Please try again.');
                  } finally {
                    setShowDeleteDialog(false);
                    setTaskToDelete(null);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setTaskToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteNoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs sm:max-w-sm flex flex-col items-center">
            <Trash2 className="h-10 w-10 text-red-500 mb-2" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">Delete Note?</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleConfirmDeleteNote}
                disabled={deletingNoteId === noteToDelete?._id}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
              >
                {deletingNoteId === noteToDelete?._id ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteNoteDialog(false);
                  setNoteToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteProjectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs sm:max-w-sm flex flex-col items-center">
            <Trash2 className="h-12 w-12 text-red-500 mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Delete Project?</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Are you sure you want to delete <span className="font-medium text-gray-900">{project?.name}</span>? 
              This action cannot be undone and will permanently remove the project and all associated data.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleConfirmDeleteProject}
                disabled={deletingProject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
              >
                {deletingProject ? 'Deleting...' : 'Delete Project'}
              </button>
              <button
                onClick={() => setShowDeleteProjectDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ClientProfile Modal */}
      {showClientProfile && client && (
        <ClientProfile
          client={client}
          onClose={() => setShowClientProfile(false)}
          onEdit={async (updatedClientData) => {
            try {
              // Call the client service to update the client
              const response = await clientService.updateClient(client._id, updatedClientData);
              if (response.data.success) {
                // Update the local client data
                setClient(updatedClientData);
                // Show success message
                setSnackbarMessage('Client updated successfully!');
                setShowSnackbar(true);
                setTimeout(() => setShowSnackbar(false), 3000);
              }
            } catch (error) {
              console.error('Error updating client:', error);
              alert('Failed to update client. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
};

export default ViewProject; 