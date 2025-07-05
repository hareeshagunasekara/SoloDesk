import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/users/change-password', data),
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
}

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getTasks: (id) => api.get(`/projects/${id}/tasks`),
  getTimeEntries: (id) => api.get(`/projects/${id}/time-entries`),
  duplicate: (id) => api.post(`/projects/${id}/duplicate`),
  archive: (id) => api.put(`/projects/${id}/archive`),
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

export default api 