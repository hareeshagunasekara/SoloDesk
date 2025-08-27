import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Tag, 
  Calendar, 
  DollarSign, 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  Edit, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Upload,
  Trash2,
  Copy,
  ExternalLink,
  Star,
  TrendingUp,
  Users,
  Briefcase,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Loader2
} from 'lucide-react';
import Button from './Button';
import { clientsAPI, fileAPI } from '../services/api';
import AddProjectModal from './AddProjectModal';
import ViewProject from './ViewProject';
import AddInvoiceModal from './AddInvoiceModal';

const ClientProfile = ({ client, onClose, onEdit, initialEditMode = false }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [updatedClient, setUpdatedClient] = useState(client || {});
  const [isSaving, setIsSaving] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // Invoices state
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);

  // AddProjectModal state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // ViewProject modal state
  const [showViewProjectModal, setShowViewProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // AddInvoiceModal state
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);

  // Notes state
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Files state
  const [uploadingFile, setUploadingFile] = useState(false);

  // Update local state when client prop changes
  useEffect(() => {
    setUpdatedClient(client || {});
  }, [client]);

  // Fetch projects when component mounts or client changes
  useEffect(() => {
    if (client?._id) {
      fetchClientProjects();
      fetchClientInvoices();
    }
  }, [client?._id]);

  const fetchClientProjects = async () => {
    if (!client?._id) return;
    
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const response = await clientsAPI.getProjects(client._id);
      if (response.data?.success) {
        setProjects(response.data.data || []);
      } else {
        setProjects([]);
        setProjectsError(response.data?.message || 'Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching client projects:', error);
      setProjects([]);
      setProjectsError(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchClientInvoices = async () => {
    if (!client?._id) return;
    
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const response = await clientsAPI.getInvoices(client._id);
      if (response.data?.success) {
        setInvoices(response.data.data || []);
      } else {
        setInvoices([]);
        setInvoicesError(response.data?.message || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching client invoices:', error);
      setInvoices([]);
      setInvoicesError(error.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Add note to client
  const handleAddNote = async () => {
    if (!newNote.trim() || !client?._id) return;

    setAddingNote(true);
    try {
      const response = await clientsAPI.addNote(client._id, newNote.trim());
      if (response.data?.success) {
        // Update the client's notes in local state
        setUpdatedClient(prev => ({
          ...prev,
          notes: [...(prev.notes || []), response.data.data]
        }));
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !client?._id) return;

    setUploadingFile(true);
    try {
      // First upload the file to get a URL
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'client-attachment');

      const uploadResponse = await fileAPI.upload(file, 'client-attachment');
      
      if (uploadResponse.data?.success) {
        // Then add the attachment to the client
        const attachmentData = {
          filename: uploadResponse.data.filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: uploadResponse.data.url
        };

        const response = await clientsAPI.addAttachment(client._id, attachmentData);
        if (response.data?.success) {
          // Update the client's attachments in local state
          setUpdatedClient(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), response.data.data]
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Remove attachment
  const handleRemoveAttachment = async (attachmentId) => {
    if (!client?._id) return;

    try {
      const response = await clientsAPI.removeAttachment(client._id, attachmentId);
      if (response.data?.success) {
        // Update the client's attachments in local state
        setUpdatedClient(prev => ({
          ...prev,
          attachments: prev.attachments.filter(att => att._id !== attachmentId)
        }));
      }
    } catch (error) {
      console.error('Error removing attachment:', error);
    }
  };



  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <FileArchive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (typeof bytes === 'string') return bytes;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-300';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'archived': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'VIP': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'high-budget': return 'bg-green-100 text-green-800 border border-green-200';
      case 'retainer': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'low-maintenance': return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'urgent': return 'bg-red-100 text-red-800 border border-red-200';
      case 'weekly client': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'quarterly review': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'seasonal': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getTagEmoji = (tag) => {
    switch (tag) {
      case 'VIP': return '⭐';
      case 'high-budget': return '💰';
      case 'retainer': return '📋';
      case 'low-maintenance': return '🔧';
      case 'urgent': return '⚡';
      case 'weekly client': return '📅';
      case 'quarterly review': return '📊';
      case 'seasonal': return '🌱';
      default: return '';
    }
  };

  const getProjectStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-gray-600 text-white border border-gray-600';
      case 'in progress': return 'bg-gray-500 text-white border border-gray-500';
      case 'planning': return 'bg-gray-400 text-white border border-gray-400';
      case 'on hold': return 'bg-gray-300 text-gray-700 border border-gray-300';
      case 'not started': return 'bg-gray-200 text-gray-700 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getInvoiceStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculatePaymentSummary = () => {
    if (!invoices || invoices.length === 0) {
      return { totalBilled: 0, totalPaid: 0, outstanding: 0 };
    }

    const totalBilled = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
    const totalPaid = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const outstanding = totalBilled - totalPaid;

    return { totalBilled, totalPaid, outstanding };
  };

  // Editing functions
  const handleDoubleClick = (field, value) => {
    setEditingField(field);
    setEditValue(value || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedData = { ...updatedClient };
      
      // Handle nested fields
      if (editingField.includes('.')) {
        const [parent, child] = editingField.split('.');
        updatedData[parent] = { ...updatedData[parent], [child]: editValue };
      } else {
        updatedData[editingField] = editValue;
      }
      
      setUpdatedClient(updatedData);
      
      // Call the onEdit prop with the updated data
      if (onEdit) {
        await onEdit(updatedData);
      }
      
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Error saving client data:', error);
    }
  };

  // Function to save all changes when "Save Changes" button is clicked
  const handleSaveAllChanges = async () => {
    try {
      setIsSaving(true);
      if (onEdit) {
        await onEdit(updatedClient);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving all changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Editable field component
  const EditableField = ({ field, value, placeholder, type = 'text', className = '' }) => {
    const isEditingThisField = editingField === field && isEditing;
    
    if (isEditingThisField) {
      return (
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${className}`}
          placeholder={placeholder}
          autoFocus
        />
      );
    }

    return (
      <div
        onClick={() => isEditing && handleDoubleClick(field, value)}
        className={`transition-colors rounded px-1 py-1 ${isEditing ? 'cursor-pointer hover:bg-gray-50' : ''} ${className} break-words`}
        title={isEditing ? "Click to edit" : ""}
      >
        {value || placeholder}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'invoices', label: 'Invoices', icon: DollarSign },
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  // Don't render if no client data
  if (!client) {
    return null;
  }

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
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Client Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left Sidebar - Client Info */}
          <div className="w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-300 flex flex-col min-h-0 max-h-[60vh] lg:max-h-none lg:rounded-br-xl lg:rounded-br-2xl">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Client Avatar & Basic Info */}
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <span className="text-lg sm:text-2xl font-bold text-gray-700">
                    {updatedClient.name 
                      ? updatedClient.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : updatedClient.companyName 
                        ? updatedClient.companyName.split(' ').map(n => n[0]).join('').toUpperCase()
                        : 'C'
                    }
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  {updatedClient.name || updatedClient.companyName || 'Unknown Client'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  {updatedClient.type === 'Company' 
                    ? updatedClient.companyName || 'Company Client'
                    : updatedClient.type === 'Individual' 
                      ? 'Individual Client'
                      : 'Client'
                  }
                </p>
                <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(updatedClient.status)}`}>
                  {updatedClient.status || 'Unknown'}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <EditableField 
                        field="email" 
                        value={updatedClient.email} 
                        placeholder="Add email address"
                        type="email"
                        className="text-xs sm:text-sm text-gray-900 truncate"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <EditableField 
                        field="phone" 
                        value={updatedClient.phone} 
                        placeholder="Add phone number"
                        type="tel"
                        className="text-xs sm:text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Street Address</p>
                      <EditableField 
                        field="address.street" 
                        value={updatedClient.address?.street} 
                        placeholder="Add street address"
                        className="text-xs sm:text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
                      <EditableField 
                        field="address.city" 
                        value={updatedClient.address?.city} 
                        placeholder="Add city"
                        className="text-xs sm:text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">State/Province</p>
                      <EditableField 
                        field="address.state" 
                        value={updatedClient.address?.state} 
                        placeholder="Add state/province"
                        className="text-xs sm:text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Country</p>
                      <EditableField 
                        field="address.country" 
                        value={updatedClient.address?.country} 
                        placeholder="Add country"
                        className="text-xs sm:text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Postal Code</p>
                      <EditableField 
                        field="address.postalCode" 
                        value={updatedClient.address?.postalCode} 
                        placeholder="Add postal code"
                        className="text-xs sm:text-sm text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Website</p>
                      <EditableField 
                        field="website" 
                        value={updatedClient.website} 
                        placeholder="Add website URL"
                        type="url"
                        className="text-xs sm:text-sm text-gray-900 truncate"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {client.tags && Array.isArray(client.tags) && client.tags.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quick Stats</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="text-xs sm:text-sm text-gray-600">Total Revenue</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(client.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-300">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Projects</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {projects.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-300">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Invoices</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {invoices.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Quick Actions */}
            <div className="p-3 sm:p-6 border-t border-gray-300 bg-gray-50 lg:rounded-br-xl lg:rounded-br-2xl">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quick Actions</h4>
                
                <Button
                  size="sm"
                  fullWidth
                  icon={isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Edit className="h-4 w-4" />}
                  onClick={isEditing ? handleSaveAllChanges : () => setIsEditing(true)}
                  disabled={isSaving}
                  className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'} text-white border-gray-800 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Client')}
                </Button>
                
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<X className="h-4 w-4" />}
                    onClick={() => {
                      setIsEditing(false);
                      setUpdatedClient(client); // Reset to original data
                    }}
                    className="border-gray-300 text-white hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  size="sm"
                  fullWidth
                  icon={<Mail className="h-4 w-4" />}
                  className="bg-gray-800 hover:bg-gray-700 text-white border-gray-800"
                >
                  Send Email
                </Button>
                
                <Button
                  size="sm"
                  fullWidth
                  icon={<DollarSign className="h-4 w-4" />}
                  onClick={() => setShowAddInvoiceModal(true)}
                  className="bg-gray-800 hover:bg-gray-700 text-white border-gray-800"
                >
                  Create Invoice
                </Button>
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
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Overview</h3>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Client Information</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Client Type</label>
                          <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                            {isEditing ? (
                              <select
                                value={updatedClient.type || 'Individual'}
                                onChange={(e) => {
                                  const newType = e.target.value;
                                  setUpdatedClient(prev => ({ ...prev, type: newType }));
                                }}
                                className="flex-1 text-xs sm:text-sm text-gray-900 bg-transparent border-none outline-none focus:ring-0"
                              >
                                <option value="Individual">👤 Individual</option>
                                <option value="Company">🏢 Company</option>
                              </select>
                            ) : (
                              <span className="text-sm text-gray-900">
                                {updatedClient.type === 'Company' ? '🏢 Company' : '👤 Individual'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                            <EditableField 
                              field="name" 
                              value={updatedClient.name} 
                              placeholder="Enter full name"
                              className="text-xs sm:text-sm text-gray-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Industry</label>
                          <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                            <EditableField 
                              field="industry" 
                              value={updatedClient.industry} 
                              placeholder="Add industry"
                              className="text-xs sm:text-sm text-gray-900"
                            />
                          </div>
                        </div>

                        {updatedClient.type === 'Company' && (
                          <>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Company Name</label>
                              <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                                <EditableField 
                                  field="companyName" 
                                  value={updatedClient.companyName} 
                                  placeholder="Enter company name"
                                  className="text-xs sm:text-sm text-gray-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Company Website</label>
                              <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                                <EditableField 
                                  field="companyWebsite" 
                                  value={updatedClient.companyWebsite} 
                                  placeholder="Enter company website"
                                  type="url"
                                  className="text-xs sm:text-sm text-gray-900"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Last Contacted</label>
                          <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            {isEditing ? (
                              <input
                                type="date"
                                value={updatedClient.lastContacted ? new Date(updatedClient.lastContacted).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newDate = e.target.value;
                                  const updatedData = { ...updatedClient, lastContacted: newDate };
                                  setUpdatedClient(updatedData);
                                }}
                                className="flex-1 text-xs sm:text-sm text-gray-900 bg-transparent border-none outline-none focus:ring-0"
                              />
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-900">
                                {updatedClient.lastContacted ? new Date(updatedClient.lastContacted).toLocaleDateString() : 'Not specified'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
                          <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                            {isEditing ? (
                              <select
                                value={updatedClient.status || 'Lead'}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  setUpdatedClient(prev => ({ ...prev, status: newStatus }));
                                }}
                                className="w-full text-xs sm:text-sm text-gray-900 bg-transparent border-none outline-none focus:ring-0"
                              >
                                <option value="Lead">🎯 Lead</option>
                                <option value="Active">✅ Active</option>
                                <option value="Inactive">❌ Inactive</option>
                                <option value="Archived">📁 Archived</option>
                              </select>
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-900">
                                {updatedClient.status || 'Lead'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tags</label>
                          <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {updatedClient.tags && updatedClient.tags.length > 0 ? (
                                updatedClient.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 text-xs font-medium rounded-lg border flex items-center gap-1 ${
                                      isEditing 
                                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 cursor-pointer' 
                                        : getTagColor(tag)
                                    }`}
                                    onClick={() => {
                                      if (isEditing) {
                                        const updatedTags = updatedClient.tags.filter((_, i) => i !== index);
                                        const updatedData = { ...updatedClient, tags: updatedTags };
                                        setUpdatedClient(updatedData);
                                      }
                                    }}
                                    title={isEditing ? "Click to remove tag" : ""}
                                  >
                                    {getTagEmoji(tag)} {tag}
                                    {isEditing && <span className="text-red-500">×</span>}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No tags added</span>
                              )}
                            </div>
                            {isEditing && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-600 mb-2">Type a tag and press Enter, or select from suggestions below</p>
                                  <input
                                    type="text"
                                    placeholder="Enter a new tag..."
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.target.value.trim()) {
                                        const newTag = e.target.value.trim();
                                        const updatedTags = [...(updatedClient.tags || []), newTag];
                                        const updatedData = { ...updatedClient, tags: updatedTags };
                                        setUpdatedClient(updatedData);
                                        e.target.value = '';
                                      }
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                  />
                                </div>
                                
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-2">Quick Add:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      { value: 'VIP', label: '⭐ VIP', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
                                      { value: 'high-budget', label: '💰 High Budget', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
                                      { value: 'retainer', label: '📋 Retainer', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
                                      { value: 'urgent', label: '⚡ Urgent', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
                                      { value: 'weekly client', label: '📅 Weekly', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
                                      { value: 'seasonal', label: '🌱 Seasonal', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' }
                                    ].map((suggestion) => (
                                      <button
                                        key={suggestion.value}
                                        onClick={() => {
                                          if (!updatedClient.tags?.includes(suggestion.value)) {
                                            const updatedTags = [...(updatedClient.tags || []), suggestion.value];
                                            const updatedData = { ...updatedClient, tags: updatedTags };
                                            setUpdatedClient(updatedData);
                                          }
                                        }}
                                        disabled={updatedClient.tags?.includes(suggestion.value)}
                                        className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                          updatedClient.tags?.includes(suggestion.value)
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : `${suggestion.color} cursor-pointer hover:scale-105 active:scale-95`
                                        }`}
                                      >
                                        {suggestion.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                  Tags help you organize and quickly identify client characteristics. Use them to mark priority levels, project types, or special requirements.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Client Since</label>
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-300">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Not specified'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <div className="p-3 bg-white rounded-xl border border-gray-300">
                            <div className="space-y-2">
                              {updatedClient.notes && updatedClient.notes.length > 0 ? (
                                updatedClient.notes.map((note, index) => (
                                  <div 
                                    key={index} 
                                    className={`text-sm text-gray-900 p-2 rounded flex items-center justify-between ${
                                      isEditing 
                                        ? 'bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer' 
                                        : 'bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      if (isEditing) {
                                        const updatedNotes = updatedClient.notes.filter((_, i) => i !== index);
                                        const updatedData = { ...updatedClient, notes: updatedNotes };
                                        setUpdatedClient(updatedData);
                                      }
                                    }}
                                    title={isEditing ? "Click to remove note" : ""}
                                  >
                                    <span>{note.content}</span>
                                    {isEditing && (
                                      <button className="text-red-500 hover:text-red-700 ml-2">
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No notes available</span>
                              )}
                            </div>
                            {isEditing && (
                              <button
                                onClick={() => {
                                  const newNote = prompt('Enter a new note:');
                                  if (newNote && newNote.trim()) {
                                    const newNoteObj = {
                                      content: newNote.trim(),
                                      createdAt: new Date()
                                    };
                                    const updatedNotes = [...(updatedClient.notes || []), newNoteObj];
                                    const updatedData = { ...updatedClient, notes: updatedNotes };
                                    setUpdatedClient(updatedData);
                                  }
                                }}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                + Add Note
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Recent Activity</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-900 flex-1">Invoice INV-002 marked as overdue</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">2 days ago</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-900 flex-1">Project "Website Redesign" updated to 65% complete</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">1 week ago</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-300">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-900 flex-1">New note added: "Client mentioned potential referral"</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">2 weeks ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Projects</h3>
                    </div>
                    <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddProjectModal(true)}>
                      New Project
                    </Button>
                  </div>

                  {/* Projects List */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <FolderOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Active Projects</h4>
                    </div>

                    {projectsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading projects...</span>
                      </div>
                    ) : projectsError ? (
                      <div className="text-center py-8 text-red-600">
                        {projectsError}
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No active projects found for this client.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projects.map((project) => (
                          <div key={project._id} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <h5 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{project.name}</h5>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                                    {project.status}
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-600">Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</span>
                                  <span className="text-xs sm:text-sm text-gray-600">Budget: {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="flex-shrink-0 border-gray-300 text-white hover:bg-gray-50" onClick={() => {
                                setSelectedProjectId(project._id);
                                setShowViewProjectModal(true);
                              }}>
                                View Details
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">{project.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-gray-600 to-gray-700 h-1.5 sm:h-2 rounded-full transition-all duration-300 shadow-sm"
                                  style={{ width: `${project.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Invoices & Payments</h3>
                    </div>
                    <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddInvoiceModal(true)}>
                      New Invoice
                    </Button>
                  </div>

                  {/* Invoices List */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Recent Invoices</h4>
                    </div>

                    {invoicesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading invoices...</span>
                      </div>
                    ) : invoicesError ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 text-sm">{invoicesError}</p>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No invoices found for this client.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {invoices.map((invoice) => (
                          <div key={invoice.id} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-300">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex-1">
                                <h5 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{invoice.number}</h5>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                                    {invoice.status}
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                                  {invoice.paidDate && (
                                    <span className="text-xs sm:text-sm text-gray-600">Paid: {new Date(invoice.paidDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2 text-white"
                                  onClick={() => {
                                    onClose(); // Close the client profile modal
                                    navigate('/invoices'); // Navigate to invoices page
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Payment Summary</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-white rounded-xl border border-gray-300">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(calculatePaymentSummary().totalPaid)}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Paid</div>
                      </div>
                      <div className="p-3 sm:p-4 bg-white rounded-xl border border-gray-300">
                        <div className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(calculatePaymentSummary().outstanding)}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Outstanding</div>
                      </div>
                      <div className="p-3 sm:p-4 bg-white rounded-xl border border-gray-300 sm:col-span-2 lg:col-span-1">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(calculatePaymentSummary().totalBilled)}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Billed</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {activeTab === 'files' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Files</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="*/*"
                      />
                      <label htmlFor="file-upload">
                        <Button 
                          size="sm" 
                          icon={<Upload className="h-4 w-4" />}
                          disabled={uploadingFile}
                          className="cursor-pointer"
                        >
                          {uploadingFile ? 'Uploading...' : 'Upload Files'}
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Files List */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <Paperclip className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Attached Files</h4>
                    </div>

                    <div className="space-y-4">
                      {updatedClient.attachments && updatedClient.attachments.length > 0 ? (
                        updatedClient.attachments.map((file) => (
                          <div key={file._id} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-300">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center flex-shrink-0">
                                {getFileIcon(file.mimeType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{file.originalName}</h5>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <a href={file.url} download={file.originalName}>
                                  <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>
                                    Download
                                  </Button>
                                </a>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
                                    View
                                  </Button>
                                </a>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  icon={<Trash2 className="h-4 w-4" />}
                                  onClick={() => handleRemoveAttachment(file._id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No files attached to this client</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notes</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Enter note content..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddNote();
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        icon={<Plus className="h-4 w-4" />}
                        onClick={handleAddNote}
                        disabled={addingNote || !newNote.trim()}
                      >
                        {addingNote ? 'Adding...' : 'Add Note'}
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Client Notes</h4>
                    </div>

                    <div className="space-y-4">
                      {updatedClient.notes && updatedClient.notes.length > 0 ? (
                        updatedClient.notes.map((note, index) => (
                          <div key={note._id || index} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-300">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700">{note.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No notes for this client</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

             {/* Add Project Modal */}
       <AddProjectModal
         isOpen={showAddProjectModal}
         onClose={() => setShowAddProjectModal(false)}
         onSubmit={async (projectData) => {
           try {
             // The modal will handle the API call internally
             // We just need to refresh the projects list
             await fetchClientProjects();
             setShowAddProjectModal(false);
           } catch (error) {
             console.error('Error adding project:', error);
           }
         }}
         clients={[client]} // Pass the current client as the only option
       />

       {/* View Project Modal */}
       <ViewProject
         isOpen={showViewProjectModal}
         onClose={() => setShowViewProjectModal(false)}
         projectId={selectedProjectId}
         onProjectUpdated={() => fetchClientProjects()}
       />

       {/* Add Invoice Modal */}
       <AddInvoiceModal
         isOpen={showAddInvoiceModal}
         onClose={() => setShowAddInvoiceModal(false)}
         onSave={async (invoiceData) => {
           try {
             // Refresh the invoices list after creating a new invoice
             await fetchClientInvoices();
             setShowAddInvoiceModal(false);
           } catch (error) {
             console.error('Error adding invoice:', error);
           }
         }}
         clients={[client]} // Pass the current client as the only option
         projects={projects} // Pass the client's projects
       />
    </div>
  );
};

export default ClientProfile; 