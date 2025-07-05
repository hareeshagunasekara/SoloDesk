import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { invoicesAPI } from '../services/api';
import { cn, formatDate, formatCurrency } from '../utils/cn';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Edit,
  Download,
  Mail,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

const InvoiceDetail = () => {
  const { id } = useParams();

  const { data: invoice, isLoading } = useQuery(
    ['invoice', id],
    () => invoicesAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  // Mock data for demonstration
  const mockInvoice = {
    id: id,
    number: 'INV-2024-001',
    client: 'TechCorp Solutions',
    clientEmail: 'contact@techcorp.com',
    status: 'sent',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 5000,
    tax: 500,
    total: 5500,
    paidAmount: 0,
    balance: 5500,
    items: [
      {
        id: 1,
        description: 'Website Design',
        quantity: 1,
        rate: 3000,
        amount: 3000,
      },
      {
        id: 2,
        description: 'Frontend Development',
        quantity: 20,
        rate: 75,
        amount: 1500,
      },
      {
        id: 3,
        description: 'Project Management',
        quantity: 10,
        rate: 50,
        amount: 500,
      },
    ],
    notes: 'Payment is due within 30 days. Please include invoice number with payment.',
    terms: 'Net 30',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const invoiceData = invoice || mockInvoice;

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'warning';
      case 'draft':
        return 'muted';
      case 'overdue':
        return 'error';
      default:
        return 'muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const daysUntilDue = Math.ceil(
    (new Date(invoiceData.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/invoices"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">
              {invoiceData.number}
            </h1>
            <p className="text-muted-foreground">
              {invoiceData.client} • {formatDate(invoiceData.issueDate, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
            Edit Invoice
          </Button>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Download PDF
          </Button>
          <Button icon={<Mail className="h-4 w-4" />}>
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Items */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Invoice Items</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {invoiceData.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">
                        {item.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.rate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-card-foreground">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoiceData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatCurrency(invoiceData.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(invoiceData.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Notes</h3>
              </div>
              <div className="card-content">
                <p className="text-muted-foreground">
                  {invoiceData.notes}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Terms</h3>
              </div>
              <div className="card-content">
                <p className="text-muted-foreground">
                  {invoiceData.terms}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Invoice Status</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={cn(
                  'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                  `bg-${getStatusColor(invoiceData.status)}/10 text-${getStatusColor(invoiceData.status)}`
                )}>
                  {getStatusIcon(invoiceData.status)}
                  <span>{invoiceData.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className={cn(
                  'text-sm font-medium',
                  daysUntilDue <= 7 ? 'text-error' : 'text-card-foreground'
                )}>
                  {formatDate(invoiceData.dueDate, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Left</span>
                <span className={cn(
                  'text-sm font-medium',
                  daysUntilDue <= 7 ? 'text-error' : 'text-card-foreground'
                )}>
                  {daysUntilDue > 0 ? daysUntilDue : 'Overdue'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payment Information</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {formatCurrency(invoiceData.total)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Paid Amount</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {formatCurrency(invoiceData.paidAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Balance</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {formatCurrency(invoiceData.balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Client Information</h3>
            </div>
            <div className="card-content space-y-3">
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {invoiceData.client}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoiceData.clientEmail}
                </p>
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
                icon={<Mail className="h-4 w-4" />}
                iconPosition="left"
              >
                Send Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Download className="h-4 w-4" />}
                iconPosition="left"
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<DollarSign className="h-4 w-4" />}
                iconPosition="left"
              >
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail; 