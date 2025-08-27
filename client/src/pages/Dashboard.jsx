import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { dashboardAPI } from '../services/api'
import { cn, formatCurrency, formatDate, formatRelativeTime } from '../utils/cn'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import AddClientModal from '../components/AddClientModal'
import AddInvoiceModal from '../components/AddInvoiceModal'
import AddProjectModal from '../components/AddProjectModal'
import {
  TrendingUp,
  TrendingDown,
  Users,
  FolderOpen,
  CheckSquare,
  DollarSign,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  Target,
  Award,
  FileText,
  Receipt,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  UserPlus,
  FilePlus,
  Play,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const queryClient = useQueryClient()
  
  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false)
  const [showAddProjectModal, setShowAddProjectModal] = useState(false)

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    'dashboard-stats',
    dashboardAPI.getStats,
    {
      staleTime: 0, // Force fresh data
      onError: (error) => {
        console.error('Dashboard stats error:', error);
      },
      onSuccess: (data) => {
        console.log('Dashboard stats success:', data);
        console.log('📈 Stats API Response:', {
          success: data.success,
          dataKeys: data.data ? Object.keys(data.data) : 'No data',
          totalClients: data.data?.totalClients,
          totalProjects: data.data?.totalProjects,
          outstandingInvoices: data.data?.outstandingInvoices,
          pendingTasks: data.data?.pendingTasks,
          totalRevenue: data.data?.totalRevenue
        });
      }
    }
  )

  const { data: recentActivity, isLoading: activityLoading, error: activityError } = useQuery(
    'dashboard-activity',
    dashboardAPI.getRecentActivity,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error) => {
        console.error('Dashboard activity error:', error);
      },
      onSuccess: (data) => {
        console.log('Dashboard activity success:', data);
      }
    }
  )

  const { data: upcomingDeadlines, isLoading: deadlinesLoading } = useQuery(
    'dashboard-deadlines',
    dashboardAPI.getUpcomingDeadlines,
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  const { data: projectProgress, isLoading: progressLoading } = useQuery(
    'dashboard-progress',
    dashboardAPI.getProjectProgress,
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  const { data: taskSummary, isLoading: taskLoading } = useQuery(
    'dashboard-tasks',
    dashboardAPI.getTaskSummary,
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  const { data: clientMetrics, isLoading: clientLoading } = useQuery(
    'dashboard-clients',
    dashboardAPI.getClientMetrics,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // Modern Stat Card Component with Brand Colors
  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', subtitle, trend }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-soft transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'p-3 rounded-lg',
          color === 'success' && 'bg-green-50 text-green-600',
          color === 'primary' && 'bg-[#210B2C]/10 text-[#210B2C]',
          color === 'warning' && 'bg-[#FFD166]/10 text-[#FFD166]',
          color === 'error' && 'bg-red-50 text-red-600',
          color === 'accent' && 'bg-[#BC96E6]/10 text-[#BC96E6]'
        )}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center text-sm font-medium',
            change >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  )

  // Activity Item Component
  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'project':
          return FolderOpen
        case 'invoice':
          return DollarSign
        case 'client':
          return Users
        case 'task':
          return CheckSquare
        case 'notification':
          return Activity
        default:
          return Activity
      }
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed':
        case 'paid':
        case 'read':
          return 'text-green-600 bg-green-50'
        case 'new':
        case 'active':
          return 'text-[#210B2C] bg-[#210B2C]/10'
        case 'pending':
        case 'unread':
          return 'text-[#FFD166] bg-[#FFD166]/10'
        case 'overdue':
        case 'draft':
          return 'text-red-600 bg-red-50'
        default:
          return 'text-gray-600 bg-gray-50'
      }
    }

    const Icon = getActivityIcon(activity.type)

    return (
      <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={cn('p-2 rounded-lg', getStatusColor(activity.status))}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1">{activity.title}</p>
          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
          <p className="text-xs text-gray-500">{formatRelativeTime(activity.time)}</p>
        </div>
      </div>
    )
  }

  // Deadline Item Component
  const DeadlineItem = ({ deadline }) => {
    const daysUntil = Math.ceil((new Date(deadline.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high':
          return 'text-red-600 bg-red-50'
        case 'medium':
          return 'text-[#FFD166] bg-[#FFD166]/10'
        case 'low':
          return 'text-green-600 bg-green-50'
        default:
          return 'text-gray-600 bg-gray-50'
      }
    }

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-lg', getPriorityColor(deadline.priority))}>
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
            <p className="text-xs text-gray-500">{deadline.type}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            'text-sm font-medium',
            daysUntil <= 7 ? 'text-red-600' : 'text-gray-600'
          )}>
            {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days`}
          </p>
          <p className="text-xs text-gray-500">{formatDate(deadline.dueDate)}</p>
        </div>
      </div>
    )
  }

  // Project Progress Item Component
  const ProjectProgressItem = ({ project }) => {
    const daysUntil = Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    
    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                 <div className="flex items-center space-x-3 flex-1">
           <div className="p-2 rounded-lg bg-[#210B2C]/10 text-[#210B2C]">
             <FolderOpen className="h-4 w-4" />
           </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">{project.name}</p>
                         <div className="w-full bg-gray-200 rounded-full h-2">
               <div 
                 className="bg-[#210B2C] h-2 rounded-full transition-all duration-300"
                 style={{ width: `${project.progress}%` }}
               />
             </div>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
          <p className="text-xs text-gray-500 capitalize">{project.status}</p>
        </div>
      </div>
    )
  }

  // Quick Action Component with Brand Colors
  const QuickAction = ({ title, icon: Icon, onClick, description }) => (
    <button onClick={onClick} className="block w-full text-left">
      <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-soft transition-all duration-200 group">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-[#210B2C]/10 text-[#210B2C] group-hover:bg-[#210B2C]/20 transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#210B2C] transition-colors" />
        </div>
      </div>
    </button>
  )

  // Debug information
  console.log('Dashboard render state:', {
    statsLoading,
    statsError,
    statsData: stats?.data?.data,
    statsRaw: stats,
    activityLoading,
    activityError,
    activityData: recentActivity?.data?.data,
    activityRaw: recentActivity
  });
  
  // Log specific stats values
  if (stats?.data?.data) {
    console.log('📊 Stats Data Details:', {
      totalClients: stats.data.data.totalClients,
      totalProjects: stats.data.data.totalProjects,
      outstandingInvoices: stats.data.data.outstandingInvoices,
      pendingTasks: stats.data.data.pendingTasks,
      totalRevenue: stats.data.data.totalRevenue
    });
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error if there's an issue
  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600 mb-4">{statsError.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const statsData = stats?.data?.data || {}
  const activityData = recentActivity?.data?.data || []
  const deadlinesData = upcomingDeadlines?.data?.data || []
  const progressData = projectProgress?.data?.data || []
  const taskData = taskSummary?.data?.data || {}
  const clientData = clientMetrics?.data?.data || {}

  return (
          <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#210B2C]">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back! Here's what's happening with your business.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setShowAddProjectModal(true)}
                >
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(statsData.totalRevenue || 0)}
            change={statsData.revenueChange}
            icon={DollarSign}
            color="success"
            subtitle="All time earnings"
          />
          <StatCard
            title="Total Clients"
            value={statsData.totalClients || 0}
            change={statsData.clientsChange}
            icon={Users}
            color="accent"
            subtitle="All clients"
          />
          <StatCard
            title="Total Projects"
            value={statsData.totalProjects || 0}
            change={statsData.projectsChange}
            icon={FolderOpen}
            color="primary"
            subtitle="All projects"
          />
          <StatCard
            title="Outstanding Invoices"
            value={statsData.outstandingInvoices || 0}
            change={statsData.invoicesChange}
            icon={FileText}
            color="error"
            subtitle="Pending payments"
          />
          <StatCard
            title="Pending Tasks"
            value={statsData.pendingTasks || 0}
            change={statsData.tasksChange}
            icon={CheckSquare}
            color="warning"
            subtitle="To be completed"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity & Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-600">Latest updates from your projects and clients</p>
                </div>
              </div>
              <div className="p-6">
                {activityLoading ? (
                  <LoadingSpinner />
                ) : activityData.length > 0 ? (
                  <div className="space-y-2">
                    {activityData.slice(0, 5).map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Progress */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
                    <p className="text-sm text-gray-600">Active projects and their completion status</p>
                  </div>
                  <Link
                    to="/projects"
                    className="text-sm text-[#210B2C] hover:text-[#210B2C]/80 font-medium flex items-center"
                  >
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {progressLoading ? (
                  <LoadingSpinner />
                ) : progressData.length > 0 ? (
                  <div className="space-y-2">
                    {progressData.slice(0, 3).map((project) => (
                      <ProjectProgressItem key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active projects</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Deadlines */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Get things done faster</p>
              </div>
              <div className="p-6 space-y-4">
                <QuickAction
                  title="Add New Client"
                  icon={UserPlus}
                  onClick={() => setShowAddClientModal(true)}
                  description="Create a new client profile"
                />
                <QuickAction
                  title="Create Invoice"
                  icon={FilePlus}
                  onClick={() => setShowAddInvoiceModal(true)}
                  description="Generate a new invoice"
                />
                <QuickAction
                  title="Start Project"
                  icon={Play}
                  onClick={() => setShowAddProjectModal(true)}
                  description="Begin a new project"
                />
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
                  <p className="text-sm text-gray-600">Tasks and projects due soon</p>
                </div>
              </div>
              <div className="p-6">
                {deadlinesLoading ? (
                  <LoadingSpinner />
                ) : deadlinesData.length > 0 ? (
                  <div className="space-y-2">
                    {deadlinesData.slice(0, 4).map((deadline) => (
                      <DeadlineItem key={deadline.id} deadline={deadline} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task Summary */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Task Summary</h3>
                <p className="text-sm text-gray-600">Your task completion overview</p>
              </div>
              <div className="p-6">
                {taskLoading ? (
                  <LoadingSpinner />
                ) : taskData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Tasks</span>
                      <span className="text-lg font-semibold text-gray-900">{taskData.totalTasks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-lg font-semibold text-green-600">{taskData.completedTasks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-lg font-semibold text-yellow-600">{taskData.pendingTasks || 0}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Completion Rate</span>
                        <span className="text-sm font-medium text-gray-900">{taskData.completionRate || 0}%</span>
                      </div>
                                             <div className="w-full bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-[#210B2C] h-2 rounded-full transition-all duration-300"
                           style={{ width: `${taskData.completionRate || 0}%` }}
                         />
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No task data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      {showAddClientModal && (
        <AddClientModal
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          onSuccess={() => {
            setShowAddClientModal(false)
            queryClient.invalidateQueries(['dashboard-stats', 'dashboard-clients'])
          }}
        />
      )}

      {showAddInvoiceModal && (
        <AddInvoiceModal
          isOpen={showAddInvoiceModal}
          onClose={() => setShowAddInvoiceModal(false)}
          onSuccess={() => {
            setShowAddInvoiceModal(false)
            queryClient.invalidateQueries(['dashboard-stats', 'dashboard-activity'])
          }}
        />
      )}

      {showAddProjectModal && (
        <AddProjectModal
          isOpen={showAddProjectModal}
          onClose={() => setShowAddProjectModal(false)}
          onSuccess={() => {
            setShowAddProjectModal(false)
            queryClient.invalidateQueries(['dashboard-stats', 'dashboard-progress', 'dashboard-activity'])
          }}
        />
      )}
    </div>
  )
}

export default Dashboard 