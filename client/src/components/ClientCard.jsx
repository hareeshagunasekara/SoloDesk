import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, 
  Edit, 
  FileText, 
  DollarSign, 
  Archive, 
  Trash2, 
  MoreVertical, 
  Calendar, 
  Mail, 
  Phone, 
  Building2, 
  User,
  ExternalLink,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  File,
  AlertTriangle,
  X,
  Star,
  Coins,
  ClipboardList,
  Wrench,
  Zap,
  Clock,
  BarChart3,
  Sprout,
  Target,
  CheckCircle,
  Circle
} from 'lucide-react';
import { clientService } from '../services/clientService';
import ClientProfile from './ClientProfile';

const ClientCard = ({ client, onViewProfile, onEdit, onAddNote, onSendInvoice, onArchive, onDelete, onDuplicate, onExportPDF, onStatusChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      if (onStatusChange) {
        await onStatusChange(client._id, newStatus);
      } else {
        // Fallback to direct API call
        const response = await clientService.updateClientStatus(client._id, newStatus);
        if (response.data.success) {
          showToast(`Status changed to ${newStatus} successfully!`, 'success');
          // Refresh the page or update the client list
          window.location.reload();
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
      showToast('Failed to change status. Please try again.', 'error');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (onDelete) {
        await onDelete(client._id);
      } else {
        // Fallback to direct API call
        const response = await clientService.deleteClient(client._id);
        if (response.data.success) {
          showToast('Client deleted successfully!', 'success');
          // Refresh the page or update the client list
          window.location.reload();
        }
      }
      setShowDeleteConfirm(false);
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting client:', error);
      showToast('Failed to delete client. Please try again.', 'error');
    }
  };

  // Format last contacted date
  const formatLastContacted = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const lastContacted = new Date(date);
    const diffTime = Math.abs(now - lastContacted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get tag color based on tag type
  const getTagColor = (tag) => {
    const tagColors = {
      'VIP': 'bg-gray-600 text-white border border-gray-600',
      'high-budget': 'bg-gray-500 text-white border border-gray-500',
      'retainer': 'bg-gray-400 text-white border border-gray-400',
      'low-maintenance': 'bg-gray-300 text-gray-700 border border-gray-300',
      'urgent': 'bg-gray-700 text-white border border-gray-700',
      'weekly client': 'bg-gray-400 text-white border border-gray-400',
      'quarterly review': 'bg-gray-500 text-white border border-gray-500',
      'seasonal': 'bg-gray-300 text-gray-700 border border-gray-300'
    };
    return tagColors[tag] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Get tag icon
  const getTagIcon = (tag) => {
    const tagIcons = {
      'VIP': <Star className="h-3 w-3" />,
      'high-budget': <Coins className="h-3 w-3" />,
      'retainer': <ClipboardList className="h-3 w-3" />,
      'low-maintenance': <Wrench className="h-3 w-3" />,
      'urgent': <Zap className="h-3 w-3" />,
      'weekly client': <Clock className="h-3 w-3" />,
      'quarterly review': <BarChart3 className="h-3 w-3" />,
      'seasonal': <Sprout className="h-3 w-3" />
    };
    return tagIcons[tag] || null;
  };

  // Calculate outstanding invoices amount
  const getOutstandingInvoices = () => {
    return client.outstandingInvoices || 0;
  };

  // Get project count and progress
  const getProjectStats = () => {
    return {
      total: client.projects?.length || 0,
      ongoing: client.ongoingProjects || 0,
      completed: client.completedProjects || 0
    };
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    const statusConfig = {
      'Lead': { color: 'bg-gray-500 text-white border border-gray-500', icon: <Target className="h-3 w-3" /> },
      'Active': { color: 'bg-gray-600 text-white border border-gray-600', icon: <CheckCircle className="h-3 w-3" /> },
      'Inactive': { color: 'bg-gray-300 text-gray-700 border border-gray-300', icon: <Circle className="h-3 w-3" /> },
      'Archived': { color: 'bg-gray-400 text-white border border-gray-400', icon: <Archive className="h-3 w-3" /> }
    };
    return statusConfig[status] || statusConfig['Inactive'];
  };

  const statusInfo = getStatusInfo(client.status);
  const projectStats = getProjectStats();
  const outstandingAmount = getOutstandingInvoices();

  const cardContent = (
    <div className="bg-gray-50 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden border border-gray-200 backdrop-blur-sm h-[28rem]">
      {/* Card Container */}
      <div className="p-6 h-full flex flex-col relative">
        {/* Subtle gradient overlay for iOS-style depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-gray-50/95 to-gray-100/30 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 h-full flex flex-col">
        {/* Header Section */}
        <div className="mb-4">
          {/* Client Name / Company Name */}
          <div className="flex items-center gap-2 mb-2">
            {client.type === 'Company' ? (
              <Building2 className="h-5 w-5 text-gray-600" />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
            <h3 className="text-base font-bold text-gray-900 truncate">
              {client.type === 'Company' ? client.companyName : client.name}
            </h3>
          </div>
          
          {/* Client Type */}
          <p className="text-xs text-gray-600 mb-2.5">
            {client.type === 'Company' ? client.name : client.type}
          </p>

          {/* Status Badge */}
          <div className="flex items-center">
            <span className={`px-4 py-1.5 rounded-2xl text-xs font-semibold shadow-sm border ${statusInfo.color} backdrop-blur-sm flex items-center gap-1.5`}>
              {statusInfo.icon} {client.status}
            </span>
          </div>
        </div>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200/50 to-transparent mb-4"></div>

        {/* Tags Section */}
        {client.tags && client.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {client.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`px-2 py-1 rounded-xl text-xs font-medium shadow-sm border ${getTagColor(tag)} backdrop-blur-sm flex-shrink-0 flex items-center gap-1`}
                  title={tag}
                >
                  {getTagIcon(tag)} {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-4">
          <div className="space-y-2.5">
            {/* Last Contacted */}
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <div className="p-1 bg-gradient-to-br from-gray-100/80 to-gray-200/40 rounded-lg shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <span className="font-medium">{formatLastContacted(client.lastContacted)}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <div className="p-1 bg-gradient-to-br from-gray-100/80 to-gray-200/40 rounded-lg shadow-sm">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <span className="truncate font-medium">{client.email}</span>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200/50 to-transparent mb-4"></div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Projects */}
          <div className="bg-gradient-to-br from-gray-100/60 via-gray-100/40 to-gray-50/80 rounded-2xl p-2.5 border border-gray-200/30 shadow-sm relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-gray-100/10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-gradient-to-br from-gray-100/80 to-gray-200/60 rounded-lg shadow-sm">
                    <FileText className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Proj</span>
                </div>
                {projectStats.ongoing > 0 && (
                  <div className="text-xs text-gray-600 font-bold bg-gray-100/60 px-1.5 py-0.5 rounded-full">
                    {projectStats.ongoing}
                  </div>
                )}
              </div>
              <div className="text-base font-bold text-gray-900">
                {projectStats.total}
              </div>
              {projectStats.ongoing > 0 && (
                <div className="text-xs text-gray-500 font-medium">
                  ongoing
                </div>
              )}
            </div>
          </div>

          {/* Outstanding Invoices */}
          <div className="bg-gradient-to-br from-gray-100/60 via-gray-100/40 to-gray-50/80 rounded-2xl p-2.5 border border-gray-200/30 shadow-sm relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-gray-100/10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-gradient-to-br from-gray-100/80 to-gray-200/60 rounded-lg shadow-sm">
                    <DollarSign className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Due</span>
                </div>
                {outstandingAmount > 0 && (
                  <div className="text-xs text-gray-700 font-bold bg-gray-200/60 px-1.5 py-0.5 rounded-full">
                    !
                  </div>
                )}
              </div>
              <div className="text-base font-bold text-gray-900">
                {outstandingAmount > 0 ? `LKR ${outstandingAmount.toLocaleString()}` : 'None'}
              </div>
              {outstandingAmount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Overdue</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 mt-auto pt-5 pb-4 border-t border-gray-200 min-h-[60px] bg-gradient-to-r from-gray-50/30 via-transparent to-gray-50/30 rounded-b-3xl relative">
          {/* Subtle gradient border effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          {/* View Button */}
          <button
            onClick={() => {
              setProfileEditMode(false);
              setShowProfile(true);
            }}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/80 rounded-xl transition-all duration-200 hover:scale-105"
            title="View Full Profile"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {/* Edit Button */}
          <button
            onClick={() => {
              setProfileEditMode(true);
              setShowProfile(true);
            }}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/80 rounded-xl transition-all duration-200 hover:scale-105"
            title="Edit Details"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          {/* Invoice Button */}
          <button
            onClick={() => onSendInvoice && onSendInvoice(client._id)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/80 rounded-xl transition-all duration-200 hover:scale-105"
            title="Create Invoice"
          >
            <DollarSign className="h-4 w-4" />
          </button>
          
          {/* Archive Button */}
          <button
            onClick={() => onArchive && onArchive(client._id)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/80 rounded-xl transition-all duration-200 hover:scale-105"
            title="Archive Client"
          >
            <Archive className="h-4 w-4" />
          </button>

          {/* More Options Button */}
          <button
            onClick={() => setShowModal(true)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/80 rounded-xl transition-all duration-200 hover:scale-105"
            title="More Options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );

  // Render modal using Portal to ensure it's outside the card container
  if (!mounted) return cardContent;

  return (
    <>
      {cardContent}
      
      {/* Styled Toast Notification */}
      {toast.show && createPortal(
        <div className="fixed top-4 right-4 z-[10000] transform transition-all duration-300 ease-out">
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 max-w-sm
            ${toast.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
            }
            transform transition-all duration-300 ease-out
            ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          `}>
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
              ${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'}
            `}>
              {toast.type === 'success' ? (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            {/* Message */}
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className={`
                flex-shrink-0 p-1 rounded-full transition-colors
                ${toast.type === 'success' 
                  ? 'text-green-600 hover:bg-green-100' 
                  : 'text-red-600 hover:bg-red-100'
                }
              `}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
      
      {showModal && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999]" 
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-sm w-full max-h-[75vh] overflow-hidden transform transition-all duration-300 ease-out border border-gray-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100/60 sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {client.type === 'Company' ? client.companyName : client.name}
                    </h3>
                    <p className="text-xs text-gray-500">More Options</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl transition-all duration-200 flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Quick Actions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-gray-800">Quick Actions</h4>
                  </div>
                  <div className="space-y-1.5">
                    <button
                      onClick={async () => {
                        try {
                          if (onAddNote) {
                            await onAddNote(client._id);
                          } else {
                            // Fallback to direct API call
                            await clientService.addNote(client._id, 'Quick note added from modal');
                          }
                          showToast('Note added successfully!', 'success');
                          setShowModal(false);
                        } catch (error) {
                          console.error('Error adding note:', error);
                          showToast('Failed to add note. Please try again.', 'error');
                        }
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100/60 rounded-lg">
                        <FileText className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="font-medium">Add Note</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (onDuplicate) {
                            await onDuplicate(client._id);
                          } else {
                            // Fallback to direct API call
                            const response = await clientService.duplicateClient(client._id);
                            if (response.data.success) {
                              showToast('Client duplicated successfully!', 'success');
                              // Refresh the page or update the client list
                              window.location.reload();
                            }
                          }
                          setShowModal(false);
                        } catch (error) {
                          console.error('Error duplicating client:', error);
                          showToast('Failed to duplicate client. Please try again.', 'error');
                        }
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100/60 rounded-lg">
                        <Edit className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="font-medium">Duplicate Client</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (onExportPDF) {
                            await onExportPDF(client._id);
                          } else {
                            // Fallback to direct API call
                            const response = await clientService.exportClientPDF(client._id);
                            if (response.data.success) {
                              showToast('PDF export initiated! Check your downloads.', 'success');
                            }
                          }
                          setShowModal(false);
                        } catch (error) {
                          console.error('Error exporting PDF:', error);
                          showToast('Failed to export PDF. Please try again.', 'error');
                        }
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100/60 rounded-lg">
                        <FileText className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="font-medium">Export as PDF</span>
                    </button>
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-gray-800">Change Status</h4>
                  </div>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleStatusChange('Lead')}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={client.status === 'Lead'}
                    >
                      <div className="p-1.5 bg-gray-100/60 rounded-lg">
                        <Target className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="font-medium">Convert to Lead</span>
                      {client.status === 'Lead' && (
                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Current</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusChange('Active')}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={client.status === 'Active'}
                    >
                      <div className="p-1.5 bg-gray-100/60 rounded-lg">
                        <CheckCircle className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="font-medium">Convert to Active</span>
                      {client.status === 'Active' && (
                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Current</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusChange('Inactive')}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={client.status === 'Inactive'}
                    >
                      <div className="p-1.5 bg-gray-100/60 rounded-lg">
                        <Circle className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="font-medium">Convert to Inactive</span>
                      {client.status === 'Inactive' && (
                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Current</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusChange('Archived')}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={client.status === 'Archived'}
                    >
                      <div className="p-1.5 bg-gray-100/60 rounded-lg">
                        <Archive className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="font-medium">Convert to Archived</span>
                      {client.status === 'Archived' && (
                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Current</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-red-300 to-red-400 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-red-700">Danger Zone</h4>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50/80 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] border border-red-200/50"
                  >
                    <div className="p-1.5 bg-red-100/60 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <span className="font-medium">Delete Client</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10001]" 
            onClick={() => setShowDeleteConfirm(false)}
            style={{ backdropFilter: 'blur(2px)' }}
          />
          
          {/* Confirmation Modal */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 ease-out"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Client
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <strong>{client.type === 'Company' ? client.companyName : client.name}</strong>? 
                  This will permanently remove the client and all associated data.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Client Profile Modal */}
      {showProfile && (
        <ClientProfile
          client={client}
          onClose={() => {
            setShowProfile(false);
            setProfileEditMode(false);
          }}
          initialEditMode={profileEditMode}
          onEdit={async (updatedClientData) => {
            try {
              // Call the client service to update the client
              const response = await clientService.updateClient(client._id, updatedClientData);
              if (response.data.success) {
                showToast('Client updated successfully!', 'success');
                // Update the local client data instead of reloading
                Object.assign(client, updatedClientData);
                // Don't close the profile modal - let user continue editing
              }
            } catch (error) {
              console.error('Error updating client:', error);
              showToast('Failed to update client. Please try again.', 'error');
            }
          }}
        />
      )}
    </>
  );
};

export default ClientCard; 