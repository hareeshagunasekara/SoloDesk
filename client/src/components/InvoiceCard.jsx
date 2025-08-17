import React, { useState } from 'react';
import { 
  Eye, 
  Mail, 
  Download, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  X,
  Calendar,
  DollarSign,
  User,
  Building2
} from 'lucide-react';
import Button from './Button';

const InvoiceCard = ({ invoices = [], onView, onSend, onDownload, onDelete, onEdit, isLoading = false, error = null }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const openModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteConfirm(true);
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      onDelete(invoiceToDelete.id);
    }
    setShowDeleteConfirm(false);
    setInvoiceToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setInvoiceToDelete(null);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Paid',
          color: 'success',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Pending',
          color: 'warning',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'overdue':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Overdue',
          color: 'error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'draft':
        return {
          icon: <FileText className="h-4 w-4" />,
          label: 'Draft',
          color: 'muted',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          label: status,
          color: 'muted',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;
    try {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const getDaysText = (days) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Loading invoices...
        </h3>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading invoices
        </h3>
        <p className="text-gray-500 mb-6">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <Button 
          variant="primary"
          icon={<FileText className="h-4 w-4" />}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No invoices found
        </h3>
        <p className="text-gray-500 mb-6">
          Create your first invoice to start billing your clients.
        </p>
        <Button 
          variant="primary"
          icon={<FileText className="h-4 w-4" />}
        >
          Create Your First Invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {invoices.map((invoice) => {
        const statusConfig = getStatusConfig(invoice.status);
        const daysUntilDue = getDaysUntilDue(invoice.dueDate);

        return (
          <div 
            key={invoice.id} 
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{invoice.number}</h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{invoice.project || 'No Project'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{invoice.clientEmail}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-xl">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </div>
                  <div className={`text-sm ${daysUntilDue <= 7 && invoice.status !== 'paid' ? 'text-red-600' : 'text-gray-500'}`}>
                    {getDaysText(daysUntilDue)}
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Total: {formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="h-3 w-3" />}
                    onClick={() => onView(invoice)}
                    className="text-white border-gray-300 hover:border-gray-400 text-xs px-2 py-1"
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Mail className="h-3 w-3" />}
                    onClick={() => onSend(invoice.id)}
                    disabled={invoice.status === 'paid'}
                    className={`text-xs px-2 py-1 ${
                      invoice.status === 'paid' 
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'text-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {invoice.status === 'draft' ? 'Send' : 'Remind'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="h-3 w-3" />}
                    onClick={() => onDownload(invoice.id)}
                    className="text-white border-gray-300 hover:border-gray-400 text-xs px-2 py-1"
                  >
                    PDF
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<MoreHorizontal className="h-3 w-3" />}
                  onClick={() => openModal(invoice)}
                  className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1"
                >
                  More
                </Button>
              </div>
            </div>


            {/* Modal */}
            {showModal && selectedInvoice && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Invoice Details
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                    {/* Invoice Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Invoice Number:</span>
                        <span className="text-sm text-gray-900">{selectedInvoice.number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedInvoice.status).bgColor} ${getStatusConfig(selectedInvoice.status).textColor}`}>
                          {getStatusConfig(selectedInvoice.status).icon}
                          <span>{getStatusConfig(selectedInvoice.status).label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Project:</span>
                        <span className="text-sm text-gray-900">{selectedInvoice.project || 'No Project'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Client:</span>
                        <span className="text-sm text-gray-900">{selectedInvoice.clientEmail}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Due Date:</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedInvoice.dueDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</span>
                      </div>
                    </div>

                    {/* Invoice Items */}
                    {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Invoice Items</h4>
                        <div className="space-y-2">
                          {selectedInvoice.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{item.description}</div>
                                <div className="text-xs text-gray-500">
                                  {item.quantity} × {formatCurrency(item.rate, selectedInvoice.currency)}
                                </div>
                              </div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {formatCurrency(item.amount, selectedInvoice.currency)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedInvoice.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Notes: </span>
                          <span className="text-gray-600">{selectedInvoice.notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Modal Actions */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit className="h-3 w-3" />}
                        onClick={() => {
                          onEdit && onEdit(selectedInvoice);
                          closeModal();
                        }}
                        className="flex-1 text-white border-gray-300 hover:border-gray-400 text-xs"
                      >
                        Edit Invoice
                      </Button>
                                          <Button
                      variant="outline"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => handleDeleteClick(selectedInvoice)}
                      className="text-white border-red-500 hover:border-red-600 bg-red-500 hover:bg-red-600 text-xs font-medium"
                    >
                      Delete
                    </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Delete Invoice
                      </h3>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Are you sure you want to delete invoice <span className="font-semibold">{invoiceToDelete?.number}</span>?
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      This action cannot be undone. The invoice will be permanently removed from your records.
                    </p>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelDelete}
                      className="text-white border-gray-300 hover:border-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={confirmDelete}
                      className="text-white border-red-500 hover:border-red-600 bg-red-500 hover:bg-red-600 font-medium"
                    >
                      Delete Invoice
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceCard; 