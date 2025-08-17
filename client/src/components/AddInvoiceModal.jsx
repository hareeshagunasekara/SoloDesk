import React, { useState, useEffect } from 'react';
import Button from './Button';
import { X, Plus, Minus, FileText, Clock, CheckCircle, Circle, Archive, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { invoicesAPI } from '../services/api';
import { projectService } from '../services/projectService';
import taskService from '../services/taskService';
import { toast } from 'react-hot-toast';

const defaultLineItem = (currency = 'USD') => ({
  project: '',
  description: '',
  quantity: 1,
  rate: 1,
  currency,
  taskId: null, // Add taskId to track if line item is from a task
  isCustom: false, // Track if this is a custom item not tied to a task
});

const AddInvoiceModal = ({ isOpen, onClose, onSave, clients = [], projects = [] }) => {
  const { user } = useAuth();
  const userCurrency = user?.preferredCurrency || 'USD';

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
  const [selectedProject, setSelectedProject] = useState(null);
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
    setSelectedProject(null);
    setProjectTasks([]);
    setUseManualMode(false);
    setLineItems([defaultLineItem(userCurrency)]);
    setError(null);
  };

  useEffect(() => {
    setCurrency(userCurrency);
    setLineItems((items) => items.map(item => ({ ...item, currency: userCurrency })));
  }, [userCurrency, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      generateInvoiceNumber();
    }
  }, [isOpen]);

  // Fetch client projects when client is selected
  useEffect(() => {
    if (selectedClient?._id && !useManualEntry) {
      fetchClientProjects(selectedClient._id);
    } else {
      setClientProjects([]);
      setSelectedProject(null);
      setProjectTasks([]);
    }
  }, [selectedClient, useManualEntry]);

  // Fetch project tasks when project is selected
  useEffect(() => {
    if (selectedProject?._id && !useManualMode) {
      fetchProjectTasks(selectedProject._id);
    } else {
      setProjectTasks([]);
    }
  }, [selectedProject, useManualMode]);

  // Auto-populate line items when tasks are loaded
  useEffect(() => {
    if (projectTasks.length > 0 && !useManualMode && selectedProject) {
      populateLineItemsFromTasks();
    }
  }, [projectTasks, useManualMode, selectedProject]);

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
      rate: selectedProject?.hourlyRate || user?.hourlyRate || 50,
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
    setSelectedProject(null);
    setProjectTasks([]);
    setLineItems([defaultLineItem(currency)]);
  };

  const handleManualEntry = () => {
    setSelectedClient(null);
    setUseManualEntry(true);
    setSelectedProject(null);
    setProjectTasks([]);
    setLineItems([defaultLineItem(currency)]);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setUseManualMode(false);
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
      const invoicePayload = {
        number: invoiceNumber.trim(),
        client: useManualEntry ? manualClient.name.trim() : selectedClient?.name,
        clientEmail: useManualEntry ? manualClient.email.trim() : selectedClient?.email,
        projectId: selectedProject?._id || null,
        amount: calcAmount(),
        tax: calcTax(),
        discount: calcDiscount(),
        total: calcTotal(),
        currency: currency,
        status: 'draft',
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
      
      console.log('Saving invoice:', invoicePayload);
      const response = await invoicesAPI.create(invoicePayload);
      console.log('Invoice saved successfully:', response);
      
      // Show success message
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
      
      if (onSave) onSave(response.data || response);
      
      // Reset form to initial state
      resetForm();
      
      onClose();
    } catch (err) {
      console.error('Error saving invoice:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Failed to create invoice.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Invoice</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[70vh] px-6 py-4 space-y-6">
          {/* 1. Client Information */}
          <section>
            <h3 className="font-semibold mb-2">Client Information</h3>
            {!useManualEntry ? (
              <div>
                <label className="block mb-1">Select Client *</label>
                <input
                  type="text"
                  placeholder="Search clients by name or email"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  className="input w-full mb-2 text-white"
                />
                <div className="max-h-32 overflow-y-auto border rounded mb-2">
                  {clients.filter(c =>
                    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.email.toLowerCase().includes(clientSearch.toLowerCase())
                  ).map(client => (
                    <div
                      key={client.id}
                      className={`p-2 cursor-pointer hover:bg-muted ${selectedClient && selectedClient.id === client.id ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                      onClick={() => handleClientSelect(client)}
                    >
                      {client.name} <span className="text-xs text-muted-foreground">({client.email})</span>
                    </div>
                  ))}
                  <div className="p-2 text-xs text-muted-foreground cursor-pointer" onClick={handleManualEntry}>
                    + Add new client manually
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block">Client Name *</label>
                <input className="input w-full text-white" value={manualClient.name} onChange={e => setManualClient({ ...manualClient, name: e.target.value })} />
                <label className="block">Email *</label>
                <input className="input w-full text-white" value={manualClient.email} onChange={e => setManualClient({ ...manualClient, email: e.target.value })} />
                <label className="block">Contact Person</label>
                <input className="input w-full text-white" value={manualClient.contact} onChange={e => setManualClient({ ...manualClient, contact: e.target.value })} />
                <label className="block">Billing Address</label>
                <textarea className="input w-full text-white" value={manualClient.address} onChange={e => setManualClient({ ...manualClient, address: e.target.value })} />
              </div>
            )}
            <label className="block mt-2">Email</label>
            <input
              className="input w-full text-white"
              value={manualClient.email}
              onChange={e => setManualClient({ ...manualClient, email: e.target.value })}
            />
            <label className="block mt-2">Contact Person</label>
            <input
              className="input w-full text-white"
              value={manualClient.contact}
              onChange={e => setManualClient({ ...manualClient, contact: e.target.value })}
            />
            <label className="block mt-2">Billing Address</label>
            <textarea
              className="input w-full text-white"
              value={manualClient.address}
              onChange={e => setManualClient({ ...manualClient, address: e.target.value })}
            />
          </section>

          {/* 2. Invoice Details */}
          <section>
            <h3 className="font-semibold mb-2">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block">Invoice Number</label>
                <input 
                  className="input w-full text-white cursor-not-allowed" 
                  value={invoiceNumber} 
                  readOnly
                  placeholder="Generating..."
                />
                <p className="text-xs text-gray-500 mt-1">Automatically generated</p>
              </div>
              <div>
                <label className="block">Invoice Date</label>
                <input type="date" className="input w-full text-white" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label className="block">Due Date *</label>
                <input type="date" className="input w-full text-white" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                <div className="flex space-x-2 mt-1">
                  <Button size="xs" variant="outline" onClick={() => handlePresetDue(7)} className="text-white">+7 days</Button>
                  <Button size="xs" variant="outline" onClick={() => handlePresetDue(14)} className="text-white">+14 days</Button>
                </div>
              </div>
              <div>
                <label className="block">Currency</label>
                <select className="input w-full text-white" value={currency} onChange={e => {
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
                <label className="block">Terms</label>
                <input className="input w-full text-white" value={terms} onChange={e => setTerms(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block">Notes</label>
                <textarea className="input w-full text-white" value={notes} onChange={e => setNotes(e.target.value)} />
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
                            selectedProject?._id === project._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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

                {selectedProject && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Selected Project: {selectedProject.name}</h4>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleManualModeToggle}
                        className="text-xs text-white"
                      >
                        {useManualMode ? 'Switch to Task Mode' : 'Manual Mode'}
                      </Button>
                    </div>
                                         <div className="text-sm text-gray-600">
                       <p><strong>Status:</strong> {selectedProject.status}</p>
                       <p><strong>Due Date:</strong> {selectedProject.dueDate ? new Date(selectedProject.dueDate).toLocaleDateString() : 'Not set'}</p>
                       <p><strong>Hourly Rate:</strong> {currency} {selectedProject.hourlyRate || user?.hourlyRate || 50}/hr</p>
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
                {selectedProject && !useManualMode ? 'Breakdown Invoice By Tasks' : 'Line Items'}
              </h3>
              {selectedProject && projectTasks.length > 0 && !useManualMode && (
                <div className="text-sm text-gray-500">
                  {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''} from project
                </div>
              )}
            </div>

            {selectedProject && !useManualMode ? (
              <div>
                {loadingTasks ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-500">Loading project tasks...</div>
                  </div>
                ) : projectTasks.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Tasks from "{selectedProject.name}" have been pre-filled. You can edit quantities, rates, and add custom items.
                      </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Type</th>
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
                                {item.isCustom ? (
                                  <span className="text-xs text-gray-500 italic">Custom Item</span>
                                ) : (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    Task
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-2">
                                <input 
                                  className="input w-full text-white text-sm" 
                                  value={item.description} 
                                  onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                                  placeholder={item.isCustom ? "Enter custom item description" : "Task description"}
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
                                  title={lineItems.length > 1 ? (item.isCustom ? "Remove custom item" : "Remove task item") : "Cannot remove the last item"}
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
                  className="flex items-center gap-2 mt-3"
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
        <div className="flex justify-end space-x-2 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={saving} className="text-white">Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceModal; 