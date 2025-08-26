import axios from 'axios'
import { clearAuthData } from '../utils/tokenUtils'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('=== API Request Debug ===')
    console.log('URL:', config.url)
    console.log('Method:', config.method)
    console.log('Token exists:', !!token)
    console.log('Token length:', token ? token.length : 0)
    console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'none')
    console.log('Current headers:', config.headers)
    
    // Special handling for login requests
    if (config.url === '/auth/login') {
      console.log('🔐 LOGIN REQUEST - No token needed for authentication')
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Adding Authorization header:', config.headers.Authorization ? 'Bearer ' + token.substring(0, 50) + '...' : 'not set')
      console.log('🔑 Full Authorization header length:', config.headers.Authorization?.length)
    } else {
      console.warn('⚠️ No token found in localStorage for request:', config.url)
      console.warn('⚠️ Available localStorage keys:', Object.keys(localStorage))
      console.warn('⚠️ This will likely result in a 401 error')
    }
    
    console.log('Final headers:', config.headers)
    console.log('========================')
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Remove debug logging since it's no longer needed
    return response
  },
  (error) => {
    console.error('=== API Response Error ===')
    console.error('URL:', error.config?.url)
    console.error('Status:', error.response?.status)
    console.error('Error message:', error.response?.data?.message)
    
    if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized - Clearing auth data and redirecting to login')
      // Clear auth data using utility function
      clearAuthData()
      
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (data) => api.put('/users/avatar', data),
  updateLogo: (data) => api.put('/users/logo', data),
  changePassword: (data) => api.put('/users/password', data),
  deleteAccount: (data) => api.delete('/users/account', { data }),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/users/notifications/read-all'),
}

// Clients API
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  getProjects: (id) => api.get(`/clients/${id}/projects`),
  getInvoices: (id) => api.get(`/clients/${id}/invoices`),
  addNote: (id, content) => api.post(`/clients/${id}/notes`, { content }),
  updateLastContacted: (id, lastContacted) => api.patch(`/clients/${id}/last-contacted`, { lastContacted }),
  getStats: () => api.get('/clients/stats'),
  importFromCSV: (formData) => api.post('/clients/import/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  importFromGoogleContacts: (accessToken) => api.post('/clients/import/google', { accessToken }),
  bulkUpdate: (clientIds, updateData) => api.patch('/clients/bulk', {
    clientIds,
    updateData
  }),
  bulkDelete: (clientIds) => api.delete('/clients/bulk', {
    data: { clientIds }
  }),
  exportClients: (format = 'csv', filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    return api.get(`/clients/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
  },
  duplicate: (id) => api.post(`/clients/${id}/duplicate`),
  exportPDF: (id) => api.get(`/clients/${id}/export/pdf`, {
    responseType: 'blob'
  }),
}

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getAvailableForInvoice: (params) => api.get('/projects/available-for-invoice', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getTasks: (id) => api.get(`/projects/${id}/tasks`),
  getTimeEntries: (id) => api.get(`/projects/${id}/time-entries`),
  duplicate: (id) => api.post(`/projects/${id}/duplicate`),
  archive: (id) => api.put(`/projects/${id}/archive`),
  addNote: (id, content) => api.post(`/projects/${id}/notes`, { content }),
  deleteNote: (projectId, noteId) => api.delete(`/projects/${projectId}/notes/${noteId}`),
}

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggleComplete: (id) => api.put(`/tasks/${id}/toggle`),
  updatePriority: (id, priority) => api.put(`/tasks/${id}/priority`, { priority }),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  assignTo: (id, userId) => api.put(`/tasks/${id}/assign`, { userId }),
  addComment: (id, comment) => api.post(`/tasks/${id}/comments`, { comment }),
  getComments: (id) => api.get(`/tasks/${id}/comments`),
}

// Time Tracking API
export const timeTrackingAPI = {
  startTimer: (data) => api.post('/time-tracking/start', data),
  stopTimer: (id) => api.put(`/time-tracking/${id}/stop`),
  pauseTimer: (id) => api.put(`/time-tracking/${id}/pause`),
  resumeTimer: (id) => api.put(`/time-tracking/${id}/resume`),
  getCurrentTimer: () => api.get('/time-tracking/current'),
  getAll: (params) => api.get('/time-tracking', { params }),
  update: (id, data) => api.put(`/time-tracking/${id}`, data),
  delete: (id) => api.delete(`/time-tracking/${id}`),
  getReport: (params) => api.get('/time-tracking/report', { params }),
}

// Invoices API
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  send: (id) => api.post(`/invoices/${id}/send`),
  markAsPaid: (id) => api.put(`/invoices/${id}/paid`),
  download: (id) => api.get(`/invoices/${id}/download`),
  duplicate: (id) => api.post(`/invoices/${id}/duplicate`),
  getItems: (id) => api.get(`/invoices/${id}/items`),
  addItem: (id, item) => api.post(`/invoices/${id}/items`, item),
  updateItem: (id, itemId, item) => api.put(`/invoices/${id}/items/${itemId}`, item),
  deleteItem: (id, itemId) => api.delete(`/invoices/${id}/items/${itemId}`),
  getNextInvoiceNumber: () => api.get('/invoices/next-number'),
}

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  processPayment: (data) => api.post('/payments/process', data),
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (data) => api.post('/payments/methods', data),
  removePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
  getStripeSetupIntent: () => api.post('/payments/stripe/setup-intent'),
}

// Calendar API
export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  createEvent: (data) => api.post('/calendar/events', data),
  updateEvent: (id, data) => api.put(`/calendar/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/calendar/events/${id}`),
  getAvailability: (params) => api.get('/calendar/availability', { params }),
  updateAvailability: (data) => api.put('/calendar/availability', data),
  getBookings: (params) => api.get('/calendar/bookings', { params }),
  createBooking: (data) => api.post('/calendar/bookings', data),
  updateBooking: (id, data) => api.put(`/calendar/bookings/${id}`, data),
  cancelBooking: (id) => api.put(`/calendar/bookings/${id}/cancel`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getUpcomingDeadlines: () => api.get('/dashboard/upcoming-deadlines'),
  getRevenueChart: (params) => api.get('/dashboard/revenue-chart', { params }),
  getProjectProgress: () => api.get('/dashboard/project-progress'),
  getTaskSummary: () => api.get('/dashboard/task-summary'),
  getClientMetrics: () => api.get('/dashboard/client-metrics'),
}

// Analytics API
export const analyticsAPI = {
  getAnalytics: (params) => api.get('/analytics', { params }),
  getRevenueData: (params) => api.get('/analytics/revenue', { params }),
  getClientMetrics: (params) => api.get('/analytics/clients', { params }),
  getProjectMetrics: (params) => api.get('/analytics/projects', { params }),
  getTimeMetrics: (params) => api.get('/analytics/time', { params }),
  exportReport: (params) => api.get('/analytics/export', { params }),
}

// Auto Messages API
export const autoMessagesAPI = {
  getMessages: (params) => api.get('/auto-messages', { params }),
  getById: (id) => api.get(`/auto-messages/${id}`),
  create: (data) => api.post('/auto-messages', data),
  update: (id, data) => api.put(`/auto-messages/${id}`, data),
  delete: (id) => api.delete(`/auto-messages/${id}`),
  toggleActive: (id) => api.put(`/auto-messages/${id}/toggle`),
  sendTest: (id) => api.post(`/auto-messages/${id}/test`),
  duplicate: (id) => api.post(`/auto-messages/${id}/duplicate`),
  getTemplates: () => api.get('/auto-messages/templates'),
}

// Settings API
export const settingsAPI = {
  getGeneral: () => api.get('/settings/general'),
  updateGeneral: (data) => api.put('/settings/general', data),
  getBilling: () => api.get('/settings/billing'),
  updateBilling: (data) => api.put('/settings/billing', data),
  getNotifications: () => api.get('/settings/notifications'),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  getIntegrations: () => api.get('/settings/integrations'),
  updateIntegrations: (data) => api.put('/settings/integrations', data),
  getTeam: () => api.get('/settings/team'),
  inviteTeamMember: (data) => api.post('/settings/team/invite', data),
  removeTeamMember: (id) => api.delete(`/settings/team/${id}`),
}

// Standalone exports for convenience
export const getUserProfile = () => userAPI.getProfile()
export const updateUserProfile = (data) => userAPI.updateProfile(data)
export const updateUserAvatar = (data) => userAPI.updateAvatar(data)
export const updateUserLogo = (data) => userAPI.updateLogo(data)
export const changePassword = (data) => userAPI.changePassword(data)
export const deleteAccount = (data) => userAPI.deleteAccount(data)

// File Upload API
export const fileAPI = {
  upload: (file, type = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (id) => api.delete(`/files/${id}`),
  getByType: (type) => api.get(`/files/${type}`),
}

export { api }
export default api 