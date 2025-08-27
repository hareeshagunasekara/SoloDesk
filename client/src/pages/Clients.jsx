import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import AddClientModal from '../components/AddClientModal';
import ClientCard from '../components/ClientCard';
import { Plus, Search, Filter, ChevronDown, Users, Loader2 } from 'lucide-react';
import clientService from '../services/clientService';
import { useAuth } from '../context/AuthContext';

const Clients = () => {
  const { isAuthenticated, user, checkTokenValidity } = useAuth();
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    tags: ''
  });

  // Fetch clients on component mount
  useEffect(() => {
    if (isAuthenticated && user && checkTokenValidity()) {
      fetchClients();
    } else if (!isAuthenticated) {
      setLoading(false);
    } else if (!checkTokenValidity()) {
      setLoading(false);
    }
  }, [searchTerm, filters, isAuthenticated, user]);



  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm || undefined,
        ...filters
      };

      const response = await clientService.getClients(params);
      
      // Handle both direct response and nested data structure
      const clientsData = response.data?.data || response.data || [];
      setClients(clientsData);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (clientData) => {
    try {
      await clientService.createClient(clientData);
      console.log('Client created successfully!');
    } catch (err) {
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const handleClientCreated = async () => {
    // Refresh clients list after successful creation
    await fetchClients();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      tags: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.status || filters.type || filters.tags || searchTerm;





  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Clients</h1>
          <p className="text-muted-foreground">
            Your relationship hub — manage client details, interactions, projects, and performance from one sleek dashboard.
          </p>
        </div>
        <div className="relative">
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="flex items-center gap-2"
          >
            Add Client
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          {showAddDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-10">
              <div className="p-2">
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-card-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => {
                    setShowAddModal(true);
                    setShowAddDropdown(false);
                  }}
                >
                  <Users className="h-4 w-4" />
                  New Client
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients by name, company, tags, or email..."
                  className="input pl-10 w-full sm:w-80"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input w-full sm:w-40 text-white"
                >
                  <option value="" className="text-white">All Status</option>
                  <option value="Lead" className="text-white">Lead</option>
                  <option value="Active" className="text-white">Active</option>
                  <option value="Inactive" className="text-white">Inactive</option>
                  <option value="Archived" className="text-white">Archived</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input w-full sm:w-40 text-white"
                >
                  <option value="" className="text-white">All Types</option>
                  <option value="Individual" className="text-white">Individual</option>
                  <option value="Company" className="text-white">Company</option>
                </select>
                
                <select
                  value={filters.tags}
                  onChange={(e) => handleFilterChange('tags', e.target.value)}
                  className="input w-full sm:w-40 text-white"
                >
                  <option value="" className="text-white">All Tags</option>
                  <option value="VIP" className="text-white">⭐ VIP</option>
                  <option value="high-budget" className="text-white">💰 High Budget</option>
                  <option value="retainer" className="text-white">📋 Retainer</option>
                  <option value="low-maintenance" className="text-white">🔧 Low Maintenance</option>
                  <option value="urgent" className="text-white">⚡ Urgent</option>
                  <option value="weekly client" className="text-white">📅 Weekly Client</option>
                  <option value="quarterly review" className="text-white">📊 Quarterly Review</option>
                  <option value="seasonal" className="text-white">🌱 Seasonal</option>
                </select>
                

                
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="w-full sm:w-auto text-muted-foreground hover:text-card-foreground"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="px-6 py-3 bg-muted/50 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Status: {filters.status}
                </span>
              )}
              {filters.type && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Type: {filters.type}
                </span>
              )}
              {filters.tags && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Tags: {filters.tags}
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="card-content">
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading clients...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchClients}>Try Again</Button>
            </div>
          ) : clients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clients.map(client => (
                <ClientCard key={client._id} client={client} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                No clients found
              </h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first client to manage your relationships.
              </p>
              <Button 
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Client
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateClient}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default Clients; 