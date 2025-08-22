import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { invoicesAPI, clientsAPI } from '../services/api';
import { downloadInvoicePDF } from '../utils/pdfUtils';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import InvoiceCard from '../components/InvoiceCard';
import InvoiceSummary from '../components/InvoiceSummary';
import AddInvoiceModal from '../components/AddInvoiceModal';
import ProjectPreviewModal from '../components/ProjectPreviewModal';
import { clientService } from '../services/clientService';
import { useAuth } from '../context/AuthContext';
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
  FolderOpen,
} from 'lucide-react';

const Invoices = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortBy, setSortBy] = useState('newest');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showProjectPreviewModal, setShowProjectPreviewModal] = useState(false);
  const [selectedProjectForInvoice, setSelectedProjectForInvoice] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(null);

  // Remove debug logging since it's no longer needed

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

  // Fetch clients data for PDF generation
  const { data: clientsData } = useQuery(
    'clients',
    async () => {
      try {
        const response = await clientsAPI.getAll();
        return response.data || response;
      } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
      }
    },
    {
      retry: 1,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Ensure invoices is always an array
  const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : [];
  const allClients = Array.isArray(clientsData) ? clientsData : [];
  
  // Remove debug logging since it's no longer needed

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

  const handleDownloadPDF = async (invoiceId, user = null) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        // Find the matching client by email
        const client = allClients.find(c => c.email === invoice.clientEmail);
        await downloadInvoicePDF(invoice, user, client);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Show error message
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await invoicesAPI.delete(invoiceId);
      // Refresh data after successful deletion
      refetch();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      // Show error message
    }
  };

  const handleCreateInvoiceFromProject = (project) => {
    console.log('Invoices: handleCreateInvoiceFromProject called with project:', project);
    console.log('Project ID:', project._id || project.id);
    console.log('Project name:', project.name);
    console.log('Project clientId:', project.clientId);
    
    setSelectedProjectForInvoice(project);
    setShowAddInvoiceModal(true);
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
      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
              <p className="text-yellow-700">Please log in to create and manage invoices.</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Log In
            </Button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-card-foreground flex items-center gap-2">
            Invoices
          </h1>
          <p className="text-muted-foreground">
            View, send, and manage all your invoices.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            icon={<FolderOpen className="h-4 w-4" />} 
            onClick={() => {
              if (!isAuthenticated) {
                alert('Please log in to preview projects');
                window.location.href = '/login';
                return;
              }
              setShowProjectPreviewModal(true);
            }}
            className="w-full sm:w-auto"
          >
            Preview Projects
          </Button>
          <Button 
            icon={<Plus className="h-4 w-4" />} 
            onClick={() => {
              if (!isAuthenticated) {
                alert('Please log in to create an invoice');
                window.location.href = '/login';
                return;
              }
              setShowAddInvoiceModal(true);
            }}
            className="w-full sm:w-auto"
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <InvoiceSummary stats={summaryStats} />

      {/* Filters and Search */}
      <div className="card">
        <div className="card-header">
          {/* Mobile: Stack filters vertically */}
          <div className="block lg:hidden space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            
            {/* Mobile Filters Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input text-sm w-full text-white bg-card-foreground"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input text-sm w-full text-white bg-card-foreground"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden lg:flex items-center justify-between">
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
            </div>
            <div className="flex items-center space-x-4">
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
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input text-sm w-40 text-white bg-card-foreground"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>
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
            onStatusUpdate={() => {
              // Refetch invoices after status update
              refetch();
            }}
            onCreateInvoice={() => {
              if (!isAuthenticated) {
                alert('Please log in to create an invoice');
                window.location.href = '/login';
                return;
              }
              setShowAddInvoiceModal(true);
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
        onClose={() => {
          setShowAddInvoiceModal(false);
          setSelectedProjectForInvoice(null);
        }}
        onSave={() => {
          setShowAddInvoiceModal(false);
          setSelectedProjectForInvoice(null);
          // Refetch invoices after successful save
          refetch();
          // Refresh project preview modal to update available projects
          if (window.refreshProjectPreviewModal) {
            window.refreshProjectPreviewModal();
          }
        }}
        clients={clients}
        projects={projects}
        selectedProject={selectedProjectForInvoice}
      />

      {/* Project Preview Modal */}
      <ProjectPreviewModal
        isOpen={showProjectPreviewModal}
        onClose={() => setShowProjectPreviewModal(false)}
        onCreateInvoice={handleCreateInvoiceFromProject}
      />
    </div>
  );
};

export default Invoices; 