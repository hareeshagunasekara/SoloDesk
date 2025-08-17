import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  Building2,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail as MailIcon
} from 'lucide-react';
import { downloadInvoicePDF } from '../utils/pdfUtils';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const InvoicePreviewModal = ({ invoice, isOpen, onClose, onSend, onDownload, onEdit, onDelete }) => {
  const { user } = useAuth();
  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
    } else {
      await downloadInvoicePDF(invoice);
    }
  };
  const modalRef = useRef(null);

  if (!isOpen || !invoice) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'PAID',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'PENDING',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'overdue':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'OVERDUE',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'draft':
        return {
          icon: <FileText className="h-4 w-4" />,
          label: 'DRAFT',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
      case 'sent':
        return {
          icon: <Mail className="h-4 w-4" />,
          label: 'SENT',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'partially_paid':
        return {
          icon: <DollarSign className="h-4 w-4" />,
          label: 'PARTIALLY PAID',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          label: status?.toUpperCase(),
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
        month: 'long',
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

  const statusConfig = getStatusConfig(invoice.status);
  const daysUntilDue = getDaysUntilDue(invoice.dueDate);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Get business name from user data
  const getBusinessName = () => {
    if (user?.businessName) {
      return user.businessName;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return null; // Don't show anything if no business name
  };

  // Get business address from user data
  const getBusinessAddress = () => {
    if (user?.address) {
      const { street, city, state, zipCode, country } = user.address;
      const addressParts = [];
      
      if (street) addressParts.push(street);
      if (city && state) {
        addressParts.push(`${city}, ${state} ${zipCode || ''}`.trim());
      } else if (city) {
        addressParts.push(city);
      }
      if (country) addressParts.push(country);
      
      return addressParts;
    }
    return []; // Return empty array if no address
  };

  // Get business contact info from user data
  const getBusinessContact = () => {
    const contact = {};
    
    if (user?.phone) contact.phone = user.phone;
    if (user?.email) contact.email = user.email;
    if (user?.website) contact.website = user.website;
    else if (user?.socialLinks?.website) contact.website = user.socialLinks.website;
    
    return contact;
  };

  const businessName = getBusinessName();
  const businessAddress = getBusinessAddress();
  const businessContact = getBusinessContact();

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Invoice Preview
              </h2>
              <p className="text-sm text-gray-600">
                {invoice.number} • {invoice.client}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
              className="text-white border-gray-300 hover:border-gray-400"
            >
              Download PDF
            </Button>
            {invoice.status !== 'paid' && (
              <Button
                size="sm"
                icon={<Mail className="h-4 w-4" />}
                onClick={onSend}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {invoice.status === 'draft' ? 'Send Invoice' : 'Send Reminder'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            />
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-8 bg-white">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Invoice #:</strong> {invoice.number}</p>
                  <p><strong>Issue Date:</strong> {formatDate(invoice.issueDate)}</p>
                  <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
                  {invoice.status !== 'paid' && (
                    <p className={`font-medium ${daysUntilDue <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                      {getDaysText(daysUntilDue)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} mb-4`}>
                  {statusConfig.icon}
                  <span>{statusConfig.label}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(invoice.total, invoice.currency)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Amount</div>
              </div>
            </div>

            {/* From and To Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* From Address */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">From:</h3>
                <div className="space-y-2">
                  {businessName && (
                    <div className="font-bold text-lg text-gray-900">{businessName}</div>
                  )}
                  <div className="text-gray-700 space-y-1">
                    {businessAddress.length > 0 && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          {businessAddress.map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {businessContact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{businessContact.phone}</span>
                      </div>
                    )}
                    {businessContact.email && (
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-gray-500" />
                        <span>{businessContact.email}</span>
                      </div>
                    )}
                    {businessContact.website && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{businessContact.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* To Address */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Bill To:</h3>
                <div className="space-y-2">
                  <div className="font-bold text-lg text-gray-900">{invoice.client}</div>
                  <div className="text-gray-700 space-y-1">
                    <div className="flex items-start gap-2">
                      <MailIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>{invoice.clientEmail}</span>
                    </div>
                    {invoice.clientAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          {invoice.clientAddress.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {invoice.clientPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{invoice.clientPhone}</span>
                      </div>
                    )}
                    {invoice.project && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>Project: {invoice.project}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900 border-b border-gray-200">Description</th>
                      <th className="text-right p-4 font-semibold text-gray-900 border-b border-gray-200">Quantity</th>
                      <th className="text-right p-4 font-semibold text-gray-900 border-b border-gray-200">Rate</th>
                      <th className="text-right p-4 font-semibold text-gray-900 border-b border-gray-200">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-b-0">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{item.description}</div>
                          {item.details && (
                            <div className="text-sm text-gray-600 mt-1">{item.details}</div>
                          )}
                        </td>
                        <td className="p-4 text-right text-gray-700">{item.quantity}</td>
                        <td className="p-4 text-right text-gray-700">{formatCurrency(item.rate, invoice.currency)}</td>
                        <td className="p-4 text-right font-semibold text-gray-900">{formatCurrency(item.amount, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span className="font-medium">{formatCurrency(invoice.tax, invoice.currency)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(invoice.discount, invoice.currency)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {invoice.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Notes:</h4>
                    <p className="text-gray-700 leading-relaxed">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Terms & Conditions:</h4>
                    <p className="text-gray-700 leading-relaxed">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>Payment Pending</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Payment has not been received yet. Please process payment by the due date.
                </p>
                <div className="mt-3 text-sm text-gray-500">
                  <span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit className="h-4 w-4" />}
                  onClick={() => {
                    onEdit(invoice);
                    onClose();
                  }}
                  className="text-white border-gray-300 hover:border-gray-400"
                >
                  Edit Invoice
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => {
                    onDelete(invoice.id);
                    onClose();
                  }}
                  className="text-white border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal; 