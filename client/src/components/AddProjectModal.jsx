import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { 
  X, 
  FolderOpen, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  File, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

const AddProjectModal = ({ isOpen, onClose, onSubmit, clients = [] }) => {
  // Ensure clients is always an array
  const safeClients = Array.isArray(clients) ? clients : [];
  
  // Debug logging
  console.log('AddProjectModal - clients prop:', clients);
  console.log('AddProjectModal - safeClients:', safeClients);
  console.log('AddProjectModal - isArray(clients):', Array.isArray(clients));
  console.log('AddProjectModal - clients length:', safeClients.length);
  console.log('AddProjectModal - clients sample:', safeClients.slice(0, 3));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Project Details
    name: '',
    clientId: '',
    status: 'Not Started',
    priority: 'Medium',
    budget: '',
    // Timeline
    startDate: '',
    endDate: '',
    dueDate: '',
    
    // Optional Info
    description: '',
    tasks: [],
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [newTask, setNewTask] = useState({ name: '', dueDate: '' });

  // Project status options
  const statusOptions = [
    { value: 'Not Started', label: 'Not Started', color: 'text-muted-foreground' },
    { value: 'In Progress', label: 'In Progress', color: 'text-blue-600' },
    { value: 'On Hold', label: 'On Hold', color: 'text-yellow-600' },
    { value: 'Completed', label: 'Completed', color: 'text-green-600' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Project name must be 100 characters or less';
    }
    
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    if (formData.budget && Number(formData.budget) < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }
    
    // Date validation
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    if (formData.dueDate && formData.startDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
      newErrors.dueDate = 'Due date cannot be before start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Task management
  const handleAddTask = () => {
    if (!newTask.name.trim()) {
      setError('Task name is required');
      return;
    }

    const task = {
      // Use temporary ID for frontend management (will be replaced by MongoDB ObjectId)
      _tempId: Date.now(),
      name: newTask.name.trim(),
      dueDate: newTask.dueDate,
      completed: false,
      createdAt: new Date()
    };

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));

    setNewTask({ name: '', dueDate: '' });
    setError(null);
  };

  const removeTask = (taskId) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task._tempId !== taskId)
    }));
  };

  // File upload handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    
    // Simulate file upload (in real app, you'd upload to cloud storage)
    const uploadPromises = files.map(file => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const attachment = {
            // Use temporary ID for frontend management
            _tempId: Date.now() + Math.random(),
            filename: `uploaded_${Date.now()}_${file.name}`,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
            // Keep previewUrl for frontend display only
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
          };
          resolve(attachment);
        }, 1000);
      });
    });

    Promise.all(uploadPromises)
      .then(attachments => {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...attachments]
        }));
        setUploadingFiles(false);
      })
      .catch(error => {
        console.error('File upload error:', error);
        setError('Failed to upload files. Please try again.');
        setUploadingFiles(false);
      });
  };

  const removeAttachment = (attachmentId) => {
    setFormData(prev => {
      const attachment = prev.attachments.find(a => a._tempId === attachmentId);
      if (attachment) {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
        if (attachment.url) {
          URL.revokeObjectURL(attachment.url);
        }
      }
      return {
        ...prev,
        attachments: prev.attachments.filter(a => a._tempId !== attachmentId)
      };
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <FileArchive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (submitting) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Find client name for success message
      const selectedClient = safeClients.find(client => client._id === formData.clientId);
      const clientName = selectedClient ? selectedClient.name : 'Unknown Client';

      // Format data to match backend model structure
      const formattedData = {
        ...formData,
        // Convert date strings to Date objects
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        dueDate: new Date(formData.dueDate),
        
        // Tasks will be created separately using Task model
        // Keep tasks array for frontend display only
        tasks: formData.tasks.map(task => ({
          name: task.name,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completed: task.completed,
          createdAt: new Date(task.createdAt)
        })),
        
        // Format attachments to match backend structure
        attachments: formData.attachments.map(attachment => ({
          filename: attachment.filename,
          originalName: attachment.originalName,
          mimeType: attachment.mimeType,
          size: attachment.size,
          url: attachment.url,
          uploadedAt: new Date(attachment.uploadedAt)
        }))
      };

      // Call the parent's onSubmit handler (which will handle the API call)
      if (onSubmit) {
        await onSubmit(formattedData);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      setError(error.message || 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    formData.attachments.forEach(attachment => {
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      if (attachment.url) {
        URL.revokeObjectURL(attachment.url);
      }
    });
    
    // Reset form
    setFormData({
      name: '',
      clientId: '',
      status: 'Not Started',
      startDate: '',
      endDate: '',
      dueDate: '',
      description: '',
      tasks: [],
      attachments: []
    });
    setErrors({});
    setNewTask({ name: '', dueDate: '' });
    setError(null);
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      formData.attachments.forEach(attachment => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
        if (attachment.url) {
          URL.revokeObjectURL(attachment.url);
        }
      });
    };
  }, [formData.attachments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* iOS Style Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Add New Project</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-600 text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Project created successfully!
            </p>
          </div>
        )}

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]" onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}>
          <div className="p-6 space-y-8">
            {/* Project Details Section - iOS Style */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              </div>
              
              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Brand Identity Revamp"
                    maxLength={100}
                    className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-500 focus:border-gray-500'} rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className={`w-full px-4 py-3 border ${errors.priority ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-500 focus:border-gray-500'} rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all`}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  {errors.priority && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.priority}</span>
                    </p>
                  )}
                </div>

                {/* Budget Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value.replace(/^(-?)/, ''))}
                      placeholder="e.g., 5000"
                      className={`w-full pl-8 pr-4 py-3 border ${errors.budget ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-500 focus:border-gray-500'} rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                  </div>
                  {errors.budget && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.budget}</span>
                    </p>
                  )}
                </div>

                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                    className={`w-full px-4 py-3 border ${errors.clientId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-500 focus:border-gray-500'} rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all`}
                  >
                    <option value="">
                      {safeClients.length === 0 ? 'No clients available - Create a client first' : 'Select Client'}
                    </option>
                    {safeClients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.name} {client.companyName ? `(${client.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.clientId}</span>
                    </p>
                  )}
                  {safeClients.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>No clients found. Please create a client first in the Clients section.</span>
                    </p>
                  )}
                </div>

                {/* Project Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 border ${errors.endDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-500 focus:border-gray-500'} rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all`}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.endDate}</span>
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className={`w-full px-4 py-3 border ${errors.dueDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-500 focus:border-gray-500'} rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all`}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.dueDate}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Optional Info</h3>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description or project scope..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all resize-none"
                />
              </div>

              {/* Quick Tasks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Tasks
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Task name"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  />
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-40 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                
                {/* Task List */}
                {formData.tasks.length > 0 && (
                  <div className="space-y-2">
                    {formData.tasks.map(task => (
                      <div key={task._tempId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.name}</p>
                          {task.dueDate && (
                            <p className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(task._tempId)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Upload
                </label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                  />
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Briefs, contracts, reference files, etc.
                  </p>
                </div>
                
                {/* File List */}
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map(attachment => (
                      <div key={attachment._tempId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {getFileIcon(attachment.mimeType)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment._tempId)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {uploadingFiles && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading files...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* iOS Style Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">
                New Project
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Project
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal; 