import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { invoicesAPI } from '../services/api';
import { downloadInvoicePDF } from '../utils/pdfUtils';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import InvoiceCard from '../components/InvoiceCard';
import InvoiceSummary from '../components/InvoiceSummary';
import AddInvoiceModal from '../components/AddInvoiceModal';
import { clientService } from '../services/clientService';
import {
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortBy, setSortBy] = useState('newest');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const res = await clientService.getClients();
        const data = res.data?.data || res.data || [];
        setClients(data);
      } catch (err) {
        setClientsError('Failed to fetch clients');
        setClients([]);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Fetch invoices with real-time data
  const { data: invoicesResponse, isLoading, error, refetch } = useQuery(
    ['invoices', searchTerm, statusFilter, dateRange, sortBy],
    async () => {
      try {
        const response = await invoicesAPI.getAll({
          search: searchTerm,
          status: statusFilter,
          startDate: dateRange.start,
          endDate: dateRange.end,
          sortBy
        });
        console.log('Raw API response:', response);
        return response.data || response;
      } catch (error) {
        console.error('Error fetching invoices:', error);
        // Return empty array as fallback
        return [];
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: 1, // Only retry once
    }
  );

  // Ensure invoices is always an array
  const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : [];
  
  // Debug logging
  console.log('Invoices API Response:', invoicesResponse);
  console.log('Processed invoices:', invoices);

  // Dummy clients and projects for modal (replace with real data as needed)
  const projects = [
    { id: '1', name: 'Logo Design' },
    { id: '2', name: 'Website Maintenance' },
    { id: '3', name: 'E-commerce Development' },
    { id: '4', name: 'Landing Page Design' },
  ];

  // Filter and sort invoices (now handled by backend)
  const filteredInvoices = invoices;

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    // Return default values if loading or if invoices is not an array
    if (isLoading || !Array.isArray(invoices)) {
      return {
        totalInvoiced: 0,
        paidCount: 0,
        overdueCount: 0,
        unpaidBalance: 0,
        totalCount: 0
      };
    }

    const totalInvoiced = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
    const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue');
    const unpaidBalance = invoices
      .filter(invoice => invoice.status !== 'paid')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    return {
      totalInvoiced,
      paidCount: paidInvoices.length,
      overdueCount: overdueInvoices.length,
      unpaidBalance,
      totalCount: invoices.length
    };
  }, [invoices, isLoading]);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      await invoicesAPI.send(invoiceId);
      // Show success message
      console.log('Invoice sent successfully');
      // Optionally refetch to update status
      refetch();
    } catch (error) {
      console.error('Error sending invoice:', error);
      // Show error message
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        await downloadInvoicePDF(invoice);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Show error message
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoicesAPI.delete(invoiceId);
        // Refresh data after successful deletion
        refetch();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        // Show error message
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-card-foreground mb-2">
          Error loading invoices
        </h3>
        <p className="text-muted-foreground">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-2">
            Invoices
          </h1>
          <p className="text-muted-foreground">
            View, send, and manage all your invoices.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddInvoiceModal(true)}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <InvoiceSummary stats={summaryStats} />

      {/* Filters and Search */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-64"
                />
              </div>
              {/* Remove the Filter button since status filter is now a dropdown */}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input text-sm w-32 text-white bg-card-foreground"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
              <span className="text-sm text-muted-foreground ml-4">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm w-32 text-white bg-card-foreground"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel - Removed since filtering is handled by dropdowns above */}
      </div>

      {/* Invoices Cards */}
      <div className="card">
        <div className="card-content p-6">
          <InvoiceCard
            invoices={filteredInvoices}
            onView={handleViewInvoice}
            onSend={handleSendInvoice}
            onDownload={handleDownloadPDF}
            onDelete={handleDeleteInvoice}
            onEdit={(invoice) => {
              // Handle edit functionality
              console.log('Edit invoice:', invoice);
            }}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <InvoicePreviewModal
          invoice={selectedInvoice}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedInvoice(null);
          }}
          onSend={() => handleSendInvoice(selectedInvoice.id)}
          onDownload={() => handleDownloadPDF(selectedInvoice.id)}
        />
      )}

      {/* AddInvoiceModal */}
      <AddInvoiceModal
        isOpen={showAddInvoiceModal}
        onClose={() => setShowAddInvoiceModal(false)}
        onSave={() => {
          setShowAddInvoiceModal(false);
          // Refetch invoices after successful save
          refetch();
        }}
        clients={clients}
        projects={projects}
      />
    </div>
  );
};

export default Invoices; 