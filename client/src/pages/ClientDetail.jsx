import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { clientsAPI } from '../services/api';
import { cn, formatDate, generateInitials } from '../utils/cn';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Calendar,
  DollarSign,
  FolderOpen,
  FileText,
  Users,
} from 'lucide-react';

const ClientDetail = () => {
  const { id } = useParams();

  const { data: client, isLoading } = useQuery(
    ['client', id],
    () => clientsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  // Mock data for demonstration
  const mockClient = {
    id: id,
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    phone: '+1 (555) 123-4567',
    website: 'https://techcorp.com',
    address: '123 Business St, San Francisco, CA 94105',
    company: 'TechCorp Solutions',
    industry: 'Technology',
    status: 'active',
    joinedDate: '2024-01-15',
    totalRevenue: 25000,
    projectCount: 5,
    invoiceCount: 8,
    contactPerson: 'John Smith',
    notes: 'Great client to work with. Always pays on time and provides clear requirements.',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const clientData = client || mockClient;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/clients"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">
              {clientData.name}
            </h1>
            <p className="text-muted-foreground">
              Client since {formatDate(clientData.joinedDate, { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
            Edit Client
          </Button>
          <Button icon={<Mail className="h-4 w-4" />}>
            Send Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Client Information</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Company
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientData.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Email
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Phone
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientData.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Website
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientData.website}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Address
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientData.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Contact Person
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientData.contactPerson}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Notes</h3>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">
                {clientData.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Avatar */}
          <div className="card">
            <div className="card-content text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-accent-foreground">
                  {generateInitials(clientData.name)}
                </span>
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">
                {clientData.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {clientData.industry}
              </p>
              <div className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                clientData.status === 'active' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {clientData.status}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Stats</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  ${clientData.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Projects</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {clientData.projectCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Invoices</span>
                </div>
                <span className="font-semibold text-card-foreground">
                  {clientData.invoiceCount}
                </span>
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
                icon={<FolderOpen className="h-4 w-4" />}
                iconPosition="left"
              >
                View Projects
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<FileText className="h-4 w-4" />}
                iconPosition="left"
              >
                View Invoices
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<DollarSign className="h-4 w-4" />}
                iconPosition="left"
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail; 