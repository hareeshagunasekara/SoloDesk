import { clientsAPI } from './api';

export const clientService = {
  // Get all clients with optional search and filtering
  getClients: async (params = {}) => {
    const response = await clientsAPI.getAll(params);
    return response;
  },

  // Get single client by ID
  getClient: async (id) => {
    const response = await clientsAPI.getById(id);
    return response;
  },

  // Create new client
  createClient: async (clientData) => {
    const response = await clientsAPI.create(clientData);
    return response;
  },

  // Update client
  updateClient: async (id, updateData) => {
    const response = await clientsAPI.update(id, updateData);
    return response;
  },

  // Delete client
  deleteClient: async (id) => {
    const response = await clientsAPI.delete(id);
    return response;
  },

  // Add note to client
  addNote: async (id, content) => {
    const response = await clientsAPI.addNote(id, content);
    return response;
  },

  // Update last contacted
  updateLastContacted: async (id, lastContacted) => {
    const response = await clientsAPI.updateLastContacted(id, lastContacted);
    return response;
  },

  // Get client statistics
  getClientStats: async () => {
    const response = await clientsAPI.getStats();
    return response;
  },

  // Import clients from CSV
  importFromCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await clientsAPI.importFromCSV(formData);
    return response;
  },

  // Import clients from Google Contacts
  importFromGoogleContacts: async (accessToken) => {
    const response = await clientsAPI.importFromGoogleContacts(accessToken);
    return response;
  },

  // Bulk operations
  bulkUpdate: async (clientIds, updateData) => {
    const response = await clientsAPI.bulkUpdate(clientIds, updateData);
    return response;
  },

  bulkDelete: async (clientIds) => {
    const response = await clientsAPI.bulkDelete(clientIds);
    return response;
  },

  // Export clients
  exportClients: async (format = 'csv', filters = {}) => {
    const response = await clientsAPI.exportClients(format, filters);
    return response;
  },

  // Update client status
  updateClientStatus: async (id, status) => {
    const response = await clientsAPI.update(id, { status });
    return response;
  },

  // Duplicate client
  duplicateClient: async (id) => {
    const response = await clientsAPI.duplicate(id);
    return response;
  },

  // Export client as PDF
  exportClientPDF: async (id) => {
    const response = await clientsAPI.exportPDF(id);
    return response;
  }
};

export default clientService; 