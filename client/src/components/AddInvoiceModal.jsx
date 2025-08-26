import React, { useState, useEffect } from 'react';
import Button from './Button';
import { X, Plus, Minus, FileText, Clock, CheckCircle, Circle, Archive, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { invoicesAPI } from '../services/api';
import { projectService } from '../services/projectService';
import taskService from '../services/taskService';
import { toast } from 'react-hot-toast';
import { extractObjectId } from '../utils/tokenUtils';

const defaultLineItem = (currency = 'USD') => ({
  project: '',
  description: '',
  quantity: 1,
  rate: 1,
  currency,
  taskId: null, // Add taskId to track if line item is from a task
  isCustom: false, // Track if this is a custom item not tied to a task
});

const AddInvoiceModal = ({ isOpen, onClose, onSave, clients = [], projects = [], selectedProject = null, invoiceToEdit = null }) => {
  const { user, isAuthenticated, token } = useAuth();
  const userCurrency = user?.preferredCurrency || 'USD';

  // Remove debug logging since it's no longer needed

  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [manualClient, setManualClient] = useState({ name: '', email: '', contact: '', address: '' });
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState(userCurrency);
  const [taxPercentage, setTaxPercentage] = useState(10); // Default 10% tax
  const [discountAmount, setDiscountAmount] = useState(0); // Default $0 discount
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Net 30');
  
  // New state for project and task functionality
  const [clientProjects, setClientProjects] = useState([]);
  const [currentSelectedProject, setCurrentSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [useManualMode, setUseManualMode] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  const [lineItems, setLineItems] = useState([defaultLineItem(userCurrency)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Function to generate next invoice number
  const generateInvoiceNumber = async () => {
    try {
      const response = await invoicesAPI.getNextInvoiceNumber();
      setInvoiceNumber(response.data?.nextNumber || 'INV-2025-0001');
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to a basic format if API fails
      const currentYear = new Date().getFullYear();
      setInvoiceNumber(`INV-${currentYear}-0001`);
    }
  };

  // Function to reset form to initial state
  const resetForm = () => {
    setClientSearch('');
    setSelectedClient(null);
    setManualClient({ name: '', email: '', contact: '', address: '' });
    setUseManualEntry(false);
    setInvoiceNumber('');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate('');
    setCurrency(userCurrency);
    setTaxPercentage(10);
    setDiscountAmount(0);
    setNotes('');
    setTerms('Net 30');
    setClientProjects([]);
    setCurrentSelectedProject(null);
    setProjectTasks([]);
    setUseManualMode(false);
    setLineItems([defaultLineItem(userCurrency)]);
    setError(null);
  };

  // Function to populate form with existing invoice data
  const populateFormWithInvoice = (invoice) => {
    if (!invoice) return;

    // Set basic invoice details
    setInvoiceNumber(invoice.number || '');
    setInvoiceDate(invoice.issueDate ? new Date(invoice.issueDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '');
    setCurrency(invoice.currency || userCurrency);
    setTaxPercentage(invoice.tax || 10);
    setDiscountAmount(invoice.discount || 0);
    setNotes(invoice.notes || '');
    setTerms(invoice.terms || 'Net 30');

    // Set client information
    if (invoice.clientEmail) {
      // Try to find existing client
      const existingClient = clients.find(c => c.email === invoice.clientEmail);
      if (existingClient) {
        setSelectedClient(existingClient);
        setClientSearch(existingClient.name || existingClient.email);
        setUseManualEntry(false);
      } else {
        // Use manual entry for client
        setManualClient({
          name: invoice.client || '',
          email: invoice.clientEmail || '',
          contact: '',
          address: ''
        });
        setUseManualEntry(true);
      }
    }

    // Set line items
    if (invoice.items && invoice.items.length > 0) {
      setLineItems(invoice.items.map(item => ({
        project: item.project || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        currency: item.currency || invoice.currency || userCurrency,
        taskId: item.taskId || null,
        isCustom: !item.taskId // If no taskId, it's a custom item
      })));
    } else {
      setLineItems([defaultLineItem(invoice.currency || userCurrency)]);
    }

    // Set project if available
    if (invoice.projectId) {
      const project = projects.find(p => p._id === invoice.projectId || p.id === invoice.projectId);
      if (project) {
        setCurrentSelectedProject(project);
      }
    }
  };

  useEffect(() => {
    setCurrency(userCurrency);
    setLineItems((items) => items.map(item => ({ ...item, currency: userCurrency })));
  }, [userCurrency, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Check authentication state
      const storedToken = localStorage.getItem('token');
      if (!storedToken || !isAuthenticated) {
        console.warn('AddInvoiceModal: User not authenticated when modal opened');
        setError('Authentication required. Please log in again.');
        onClose();
        return;
      }
      
      resetForm();
      
      // If editing an invoice, populate the form
      if (invoiceToEdit) {
        populateFormWithInvoice(invoiceToEdit);
      } else {
        // Only generate new invoice number if not editing
        generateInvoiceNumber();
      }
      
      // If a project is selected, pre-populate the form
      if (selectedProject) {
        // Ensure the project has the correct structure
        const processedProject = {
          ...selectedProject,
          _id: extractObjectId(selectedProject) || selectedProject._id || selectedProject.id, // Use utility function
          name: selectedProject.name || selectedProject.title,
          clientId: selectedProject.clientId || selectedProject.client,
        };
        
        setCurrentSelectedProject(processedProject);
        
        // Handle client data
        if (processedProject.clientId) {
          const clientData = processedProject.clientId;
          if (typeof clientData === 'object' && clientData._id) {
            // Client is a populated object
            setSelectedClient(clientData);
            const clientId = extractObjectId(clientData);
            if (clientId) {
              fetchClientProjects(clientId);
            }
          } else if (typeof clientData === 'string') {
            // Client is just an ID string
            const clientId = extractObjectId(clientData);
            if (clientId) {
              // Could fetch client data here if needed
            } else {
              console.warn('Invalid client ID format:', clientData);
            }
          }
        }
      }
    }
  }, [isOpen, selectedProject, isAuthenticated, invoiceToEdit]);

  // Fetch client projects when client is selected
  useEffect(() => {
    if (selectedClient?._id && !useManualEntry) {
      fetchClientProjects(selectedClient._id);
    } else {
      setClientProjects([]);
      setCurrentSelectedProject(null);
      setProjectTasks([]);
    }
  }, [selectedClient, useManualEntry]);

  // Fetch project tasks when project is selected
  useEffect(() => {
    if (currentSelectedProject?._id && !useManualMode) {
      fetchProjectTasks(currentSelectedProject._id);
    } else {
      setProjectTasks([]);
    }
  }, [currentSelectedProject, useManualMode]);

  // Auto-populate line items when tasks are loaded
  useEffect(() => {
    if (projectTasks.length > 0 && !useManualMode && currentSelectedProject) {
      populateLineItemsFromTasks();
    }
  }, [projectTasks, useManualMode, currentSelectedProject]);

  // Test function to verify project assignment
  const testProjectAssignment = () => {
    // Remove debug logging since it's no longer needed
  };

  // Expose test function globally for debugging
  useEffect(() => {
    if (window) {
      window.testProjectAssignment = testProjectAssignment;
    }
    return () => {
      if (window) {
        delete window.testProjectAssignment;
      }
    };
  }, [currentSelectedProject, selectedProject]);

  const fetchClientProjects = async (clientId) => {
    setLoadingProjects(true);
    try {
      const response = await projectService.getAllProjects({ clientId });
      setClientProjects(response.data || response || []);
    } catch (error) {
      console.error('Error fetching client projects:', error);
      setClientProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectTasks = async (projectId) => {
    setLoadingTasks(true);
    try {
      const response = await taskService.getProjectTasks(projectId);
      if (response.success) {
        setProjectTasks(response.data || []);
      } else {
        setProjectTasks([]);
      }
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      setProjectTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const populateLineItemsFromTasks = () => {
    const taskBasedItems = projectTasks.map(task => ({
      ...defaultLineItem(currency),
      description: task.name,
      quantity: 1,
      rate: currentSelectedProject?.hourlyRate || user?.hourlyRate || 50,
      taskId: task._id,
      isCustom: false,
    }));
    
    // Add one empty custom item at the end
    taskBasedItems.push({
      ...defaultLineItem(currency),
      description: '',
      isCustom: true,
    });
    
    setLineItems(taskBasedItems);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setManualClient({
      name: client.name,
      email: client.email || '',
      contact: client.name || '',
      address: client.address ? [client.address.street, client.address.city, client.address.state, client.address.country, client.address.postalCode].filter(Boolean).join(', ') : '',
    });
    setUseManualEntry(false);
    setCurrentSelectedProject(null);
    setProjectTasks([]);
    setLineItems([defaultLineItem(currency)]);
  };

  const handleManualEntry = () => {
    setSelectedClient(null);
    setUseManualEntry(true);
    setCurrentSelectedProject(null);
    setProjectTasks([]);
    setLineItems([defaultLineItem(currency)]);
  };

  const handleProjectSelect = (project) => {
    if (!project) {
      setCurrentSelectedProject(null);
      setProjectTasks([]);
      return;
    }

    const extractedId = extractObjectId(project);
    if (extractedId) {
      setCurrentSelectedProject({
        _id: extractedId,
        name: project.name || project.title || 'Unknown Project',
        status: project.status || 'active',
        dueDate: project.dueDate || project.endDate || null,
      });
      
      // Fetch tasks for this project
      fetchProjectTasks(extractedId);
    } else {
      console.warn('Invalid project ID format:', project._id || project.id);
      setCurrentSelectedProject(null);
      setProjectTasks([]);
    }
  };

  const handleManualModeToggle = () => {
    setUseManualMode(!useManualMode);
    if (!useManualMode) {
      // Switching to manual mode - clear task-based items
      setLineItems([defaultLineItem(currency)]);
    } else {
      // Switching back to task mode - repopulate from tasks
      if (projectTasks.length > 0) {
        populateLineItemsFromTasks();
      }
    }
  };

  const handleLineItemChange = (idx, field, value) => {
    const updated = [...lineItems];
    updated[idx][field] = value;
    setLineItems(updated);
  };

  const addLineItem = () => setLineItems([...lineItems, defaultLineItem(currency)]);
  const removeLineItem = (idx) => {
    // Prevent removing the last item to ensure there's always at least one line item
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== idx));
    }
  };

  const handlePresetDue = (days) => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + days);
    setDueDate(date.toISOString().slice(0, 10));
  };

  // Calculate totals
  const calcAmount = () => lineItems.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.rate || 1)), 0);
  const calcTax = () => (calcAmount() * (taxPercentage / 100));
  const calcDiscount = () => Number(discountAmount) || 0;
  const calcTotal = () => calcAmount() + calcTax() - calcDiscount();

  const getStatusIcon = (status) => {
    const statusIcons = {
      'In Progress': <Clock className="h-3 w-3" />,
      'Completed': <CheckCircle className="h-3 w-3" />,
      'On Hold': <Circle className="h-3 w-3" />,
      'Archived': <Archive className="h-3 w-3" />,
      'Lead': <Target className="h-3 w-3" />
    };
    return statusIcons[status] || <Circle className="h-3 w-3" />;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'In Progress': 'text-blue-600 bg-blue-50',
      'Completed': 'text-green-600 bg-green-50',
      'On Hold': 'text-yellow-600 bg-yellow-50',
      'Archived': 'text-gray-600 bg-gray-50',
      'Lead': 'text-purple-600 bg-purple-50'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-50';
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    // Check authentication first
    if (!isAuthenticated || !token) {
      setError('You must be logged in to create an invoice. Please log in and try again.');
      setSaving(false);
      return;
    }
    
    // Additional token validation
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Authentication token not found. Please log in again.');
      setSaving(false);
      return;
    }
    
    // Validation
    if (!invoiceNumber.trim()) {
      setError('Invoice number is required');
      setSaving(false);
      return;
    }
    
    if (!useManualEntry && !selectedClient) {
      setError('Please select a client');
      setSaving(false);
      return;
    }
    
    if (useManualEntry && (!manualClient.name.trim() || !manualClient.email.trim())) {
      setError('Client name and email are required');
      setSaving(false);
      return;
    }
    
    if (!dueDate) {
      setError('Due date is required');
      setSaving(false);
      return;
    }
    
    if (lineItems.length === 0 || lineItems.every(item => !item.description.trim())) {
      setError('At least one line item with description is required');
      setSaving(false);
      return;
    }
    
    try {
      // Validate projectId if present
      let validatedProjectId = null;
      
      if (currentSelectedProject) {
        validatedProjectId = extractObjectId(currentSelectedProject);
      }
      
      const invoicePayload = {
        number: invoiceNumber.trim(),
        client: useManualEntry ? manualClient.name.trim() : selectedClient?.name,
        clientEmail: useManualEntry ? manualClient.email.trim() : selectedClient?.email,
        amount: calcAmount(),
        tax: calcTax(),
        discount: calcDiscount(),
        total: calcTotal(),
        currency: currency,
        status: invoiceToEdit ? invoiceToEdit.status : 'draft', // Preserve status when editing
        dueDate: new Date(dueDate),
        issueDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        items: lineItems
          .filter(item => item.description.trim()) // Only include items with descriptions
          .map(item => ({
            description: item.description.trim(),
            quantity: Number(item.quantity || 1),
            rate: Number(item.rate || 1),
            amount: Number(item.quantity || 1) * Number(item.rate || 1),
            taskId: item.taskId || null,
            isCustom: item.isCustom || false,
          })),
        notes: notes.trim() || null,
        terms: terms.trim() || null,
      };
      
      // Only add projectId if it's valid
      if (validatedProjectId) {
        invoicePayload.projectId = validatedProjectId;
      }
      
      // Remove debug logging since it's no longer needed
      
      // Double-check token is available
      if (!storedToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      let response;
      if (invoiceToEdit) {
        // Update existing invoice
        response = await invoicesAPI.update(invoiceToEdit.id, invoicePayload);
        toast.success(`Invoice ${invoiceNumber} updated successfully!`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
        });
      } else {
        // Create new invoice
        response = await invoicesAPI.create(invoicePayload);
        toast.success(`Invoice ${invoiceNumber} created successfully!`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
        });
      }
      
      if (onSave) onSave(response.data || response);
      
      // Reset form to initial state
      resetForm();
      
      onClose();
    } catch (err) {
      console.error('Error saving invoice:', err);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 400) {
        if (err.response?.data?.errors) {
          // Handle validation errors
          const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
          setError(errorMessages);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Invalid data provided. Please check your input.');
        }
      } else {
        const action = invoiceToEdit ? 'update' : 'create';
        setError(err.response?.data?.message || `Failed to ${action} invoice. Please try again.`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {invoiceToEdit ? `Edit Invoice ${invoiceToEdit.number}` : 'Add New Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[75vh] sm:max-h-[70vh] px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
          {/* 1. Client Information */}
          <section>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Client Information</h3>
            {!useManualEntry ? (
              <div>
                <label className="block mb-1 text-sm">Select Client *</label>
                <input
                  type="text"
                  placeholder="Search clients by name or email"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  className="input w-full mb-2 text-white text-sm"
                />
                <div className="max-h-32 overflow-y-auto border rounded mb-2">
                  {clients.filter(c =>
                    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.email.toLowerCase().includes(clientSearch.toLowerCase())
                  ).map(client => (
                    <div
                      key={client.id}
                      className={`p-2 cursor-pointer hover:bg-muted text-sm ${selectedClient && selectedClient.id === client.id ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground break-all">({client.email})</div>
                    </div>
                  ))}
                  <div className="p-2 text-xs text-muted-foreground cursor-pointer" onClick={handleManualEntry}>
                    + Add new client manually
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm">Client Name *</label>
                <input className="input w-full text-white text-sm" value={manualClient.name} onChange={e => setManualClient({ ...manualClient, name: e.target.value })} />
                <label className="block text-sm">Email *</label>
                <input className="input w-full text-white text-sm" value={manualClient.email} onChange={e => setManualClient({ ...manualClient, email: e.target.value })} />
                <label className="block text-sm">Contact Person</label>
                <input className="input w-full text-white text-sm" value={manualClient.contact} onChange={e => setManualClient({ ...manualClient, contact: e.target.value })} />
                <label className="block text-sm">Billing Address</label>
                <textarea className="input w-full text-white text-sm" value={manualClient.address} onChange={e => setManualClient({ ...manualClient, address: e.target.value })} />
              </div>
            )}
            <label className="block mt-2 text-sm">Email</label>
            <input
              className="input w-full text-white text-sm"
              value={manualClient.email}
              onChange={e => setManualClient({ ...manualClient, email: e.target.value })}
            />
            <label className="block mt-2 text-sm">Contact Person</label>
            <input
              className="input w-full text-white text-sm"
              value={manualClient.contact}
              onChange={e => setManualClient({ ...manualClient, contact: e.target.value })}
            />
            <label className="block mt-2 text-sm">Billing Address</label>
            <textarea
              className="input w-full text-white text-sm"
              value={manualClient.address}
              onChange={e => setManualClient({ ...manualClient, address: e.target.value })}
            />
          </section>

          {/* 2. Invoice Details */}
          <section>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Invoice Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm">Invoice Number</label>
                <input 
                  className={`input w-full text-white text-sm ${invoiceToEdit ? '' : 'cursor-not-allowed'}`}
                  value={invoiceNumber} 
                  readOnly={!invoiceToEdit}
                  onChange={invoiceToEdit ? (e) => setInvoiceNumber(e.target.value) : undefined}
                  placeholder={invoiceToEdit ? "Enter invoice number" : "Generating..."}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {invoiceToEdit ? 'You can edit the invoice number' : 'Automatically generated'}
                </p>
              </div>
              <div>
                <label className="block text-sm">Invoice Date</label>
                <input type="date" className="input w-full text-white text-sm" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Due Date *</label>
                <input type="date" className="input w-full text-white text-sm" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button size="xs" variant="outline" onClick={() => handlePresetDue(7)} className="text-white text-xs">+7 days</Button>
                  <Button size="xs" variant="outline" onClick={() => handlePresetDue(14)} className="text-white text-xs">+14 days</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm">Currency</label>
                <select className="input w-full text-white text-sm" value={currency} onChange={e => {
                  setCurrency(e.target.value);
                  setLineItems(items => items.map(item => ({ ...item, currency: e.target.value })));
                }}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="LKR">LKR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="INR">INR</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Terms</label>
                <input className="input w-full text-white text-sm" value={terms} onChange={e => setTerms(e.target.value)} />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm">Notes</label>
                <textarea className="input w-full text-white text-sm" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </section>

          {/* 3. Project Section */}
          {selectedClient && !useManualEntry && (
            <section>
              <h3 className="font-semibold mb-2">Project Selection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Select Project</label>
                  {loadingProjects ? (
                    <div className="text-sm text-gray-500">Loading projects...</div>
                  ) : clientProjects.length > 0 ? (
                    <div className="grid gap-2">
                      {clientProjects.map(project => (
                        <div
                          key={project._id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                            currentSelectedProject?._id === project._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => handleProjectSelect(project)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{project.name}</h4>
                              <p className="text-sm text-gray-600">{project.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(project.status)}`}>
                                {getStatusIcon(project.status)} {project.status}
                              </span>
                              {project.dueDate && (
                                <span className="text-xs text-gray-500">
                                  Due: {new Date(project.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No projects found for this client.</div>
                  )}
                </div>

                {currentSelectedProject && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-3">
                      <h4 className="font-medium text-sm sm:text-base break-words">Selected Project: {currentSelectedProject.name}</h4>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleManualModeToggle}
                        className="text-xs text-white w-full sm:w-auto"
                      >
                        {useManualMode ? 'Switch to Task Mode' : 'Manual Mode'}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Status:</strong> {currentSelectedProject.status}</p>
                      <p><strong>Due Date:</strong> {currentSelectedProject.dueDate ? new Date(currentSelectedProject.dueDate).toLocaleDateString() : 'Not set'}</p>
                      <p><strong>Hourly Rate:</strong> {currency} {currentSelectedProject.hourlyRate || user?.hourlyRate || 50}/hr</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 4. Line Items / Tasks Section */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                {currentSelectedProject && !useManualMode ? 'Breakdown Invoice By Tasks' : 'Line Items'}
              </h3>
              {currentSelectedProject && projectTasks.length > 0 && !useManualMode && (
                <div className="text-sm text-gray-500">
                  {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''} from project
                </div>
              )}
            </div>

            {currentSelectedProject && !useManualMode ? (
              <div>
                {loadingTasks ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-500">Loading project tasks...</div>
                  </div>
                ) : projectTasks.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Tasks from "{currentSelectedProject.name}" have been pre-filled. You can edit quantities, rates, and add custom items.
                      </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-700">Type</th>
                            <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-700">Description</th>
                            <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-700">Qty</th>
                            <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-700">Rate</th>
                            <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-700">Total</th>
                            <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-2 px-1 sm:px-2">
                                {item.isCustom ? (
                                  <span className="text-xs text-gray-500 italic">Custom</span>
                                ) : (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-1 sm:px-2 py-1 rounded">
                                    Task
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-1 sm:px-2">
                                <input 
                                  className="input w-full text-white text-xs sm:text-sm" 
                                  value={item.description} 
                                  onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                                  placeholder={item.isCustom ? "Enter custom item description" : "Task description"}
                                />
                              </td>
                              <td className="py-2 px-1 sm:px-2">
                                <input 
                                  type="number" 
                                  className="input w-12 sm:w-16 text-white text-xs sm:text-sm" 
                                  value={item.quantity} 
                                  min={1} 
                                  onChange={e => handleLineItemChange(idx, 'quantity', e.target.value)} 
                                />
                              </td>
                              <td className="py-2 px-1 sm:px-2">
                                <input 
                                  type="number" 
                                  className="input w-16 sm:w-20 text-white text-xs sm:text-sm" 
                                  value={item.rate} 
                                  min={0} 
                                  onChange={e => handleLineItemChange(idx, 'rate', e.target.value)} 
                                />
                              </td>
                              <td className="py-2 px-1 sm:px-2 text-xs sm:text-sm font-medium">
                                {currency} {((item.quantity || 1) * (item.rate || 1)).toFixed(2)}
                              </td>
                              <td className="py-2 px-1 sm:px-2">
                                <button
                                  onClick={() => removeLineItem(idx)}
                                  className={`${lineItems.length > 1 ? 'text-red-500 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}`}
                                  title={lineItems.length > 1 ? (item.isCustom ? "Remove custom item" : "Remove task item") : "Cannot remove the last item"}
                                  disabled={lineItems.length <= 1}
                                >
                                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={addLineItem}
                      className="flex items-center gap-2 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Custom Item
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No tasks found in this project.</p>
                    <p className="text-sm text-gray-400 mb-4">You can manually add items below or switch to Manual Mode.</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleManualModeToggle}
                    >
                      Switch to Manual Mode
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Description</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Qty</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Rate</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Total</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-2">
                            <input 
                              className="input w-full text-white text-sm" 
                              value={item.description} 
                              onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                              placeholder="Enter item description"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              type="number" 
                              className="input w-16 text-white text-sm" 
                              value={item.quantity} 
                              min={1} 
                              onChange={e => handleLineItemChange(idx, 'quantity', e.target.value)} 
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              type="number" 
                              className="input w-20 text-white text-sm" 
                              value={item.rate} 
                              min={0} 
                              onChange={e => handleLineItemChange(idx, 'rate', e.target.value)} 
                            />
                          </td>
                          <td className="py-2 px-2 text-sm font-medium">
                            {currency} {((item.quantity || 1) * (item.rate || 1)).toFixed(2)}
                          </td>
                          <td className="py-2 px-2">
                            <button
                              onClick={() => removeLineItem(idx)}
                              className={`${lineItems.length > 1 ? 'text-red-500 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}`}
                              title={lineItems.length > 1 ? "Remove item" : "Cannot remove the last item"}
                              disabled={lineItems.length <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={addLineItem}
                  className="flex items-center gap-2 mt-3 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            )}
          </section>

          {/* 5. Invoice Summary */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Invoice Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{currency} {calcAmount().toFixed(2)}</span>
              </div>
              
              {/* Tax Section */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <span>Tax:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value) || 0)}
                    className="w-12 text-center bg-transparent border-none text-gray-700 font-medium focus:outline-none focus:ring-0 text-sm"
                  />
                  <span className="text-gray-500">%</span>
                </div>
                <span className="font-medium">{currency} {calcTax().toFixed(2)}</span>
              </div>
              
              {/* Discount Section */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <span>Discount:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                    className="w-16 text-center bg-transparent border-none text-gray-700 font-medium focus:outline-none focus:ring-0 text-sm"
                  />
                  <span className="text-gray-500">{currency}</span>
                </div>
                <span className="font-medium">-{currency} {calcDiscount().toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{currency} {calcTotal().toFixed(2)}</span>
              </div>
            </div>
          </section>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={saving} className="text-white w-full sm:w-auto">Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceModal; 