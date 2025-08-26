import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { dashboardAPI } from '../services/api'
import { cn, formatCurrency, formatDate, formatRelativeTime } from '../utils/cn'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
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
  LineChart
} from 'lucide-react'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    dashboardAPI.getStats,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    'dashboard-activity',
    dashboardAPI.getRecentActivity,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
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

  // Stat Card Component
  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', subtitle }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-error mr-1" />
              )}
              <span
                className={cn(
                  'stat-change',
                  change >= 0 ? 'stat-change-positive' : 'stat-change-negative'
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', `bg-${color}/10`)}>
          <Icon className={cn('h-6 w-6', `text-${color}`)} />
        </div>
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
          return 'success'
        case 'new':
        case 'active':
          return 'accent'
        case 'pending':
        case 'unread':
          return 'warning'
        case 'overdue':
        case 'draft':
          return 'error'
        default:
          return 'muted'
      }
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'completed':
        case 'paid':
        case 'read':
          return CheckCircle
        case 'pending':
        case 'unread':
          return ClockIcon
        case 'overdue':
          return AlertCircle
        case 'draft':
          return FileText
        default:
          return Activity
      }
    }

    const Icon = getActivityIcon(activity.type)
    const StatusIcon = getStatusIcon(activity.status)

    return (
      <div className="notification-item">
        <div className={cn('notification-icon', `bg-${getStatusColor(activity.status)}/10`)}>
          <Icon className={cn('h-4 w-4', `text-${getStatusColor(activity.status)}`)} />
        </div>
        <div className="notification-content">
          <div className="flex items-center justify-between">
            <p className="notification-title">{activity.title}</p>
            <StatusIcon className={cn('h-4 w-4', `text-${getStatusColor(activity.status)}`)} />
          </div>
          <p className="notification-message">{activity.description}</p>
          <p className="notification-time">{formatRelativeTime(activity.time)}</p>
        </div>
      </div>
    )
  }

  // Deadline Item Component
  const DeadlineItem = ({ deadline }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high':
        case 'urgent':
          return 'error'
        case 'medium':
          return 'warning'
        case 'low':
          return 'success'
        default:
          return 'muted'
      }
    }

    const getPriorityIcon = (priority) => {
      switch (priority) {
        case 'high':
        case 'urgent':
          return AlertCircle
        case 'medium':
          return ClockIcon
        case 'low':
          return CheckCircle
        default:
          return ClockIcon
      }
    }

    const PriorityIcon = getPriorityIcon(deadline.priority)
    const daysUntil = deadline.daysUntil || Math.ceil(
      (new Date(deadline.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    )

    return (
      <div className="task-item">
        <div className="flex items-center space-x-3">
          <div className={cn('w-2 h-2 rounded-full', `bg-${getPriorityColor(deadline.priority)}`)} />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <PriorityIcon className={cn('h-4 w-4', `text-${getPriorityColor(deadline.priority)}`)} />
              <p className="task-title">{deadline.title}</p>
            </div>
            <p className="text-xs text-muted-foreground">{deadline.client}</p>
            <p className="text-xs text-muted-foreground capitalize">{deadline.type}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-card-foreground">
            {formatDate(deadline.dueDate, { month: 'short', day: 'numeric' })}
          </p>
          <p className={cn('text-xs', daysUntil <= 3 ? 'text-error' : 'text-muted-foreground')}>
            {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days left`}
          </p>
        </div>
      </div>
    )
  }

  // Project Progress Item Component
  const ProjectProgressItem = ({ project }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'In Progress':
          return 'warning'
        case 'Completed':
          return 'success'
        case 'On Hold':
          return 'error'
        default:
          return 'muted'
      }
    }

    const daysUntil = Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24))

    return (
      <div className="task-item">
        <div className="flex items-center space-x-3">
          <div className={cn('w-2 h-2 rounded-full', `bg-${getStatusColor(project.status)}`)} />
          <div className="flex-1">
            <p className="task-title">{project.name}</p>
            <p className="text-xs text-muted-foreground">{project.client}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className={cn('h-2 rounded-full transition-all', `bg-${getStatusColor(project.status)}`)}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{project.progress}%</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-card-foreground capitalize">
            {project.status.toLowerCase()}
          </p>
          <p className={cn('text-xs', daysUntil <= 7 ? 'text-error' : 'text-muted-foreground')}>
            {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days left`}
          </p>
        </div>
      </div>
    )
  }

  // Quick Action Component
  const QuickAction = ({ title, icon: Icon, href, variant = 'outline' }) => (
    <Link to={href}>
      <Button
        variant={variant}
        size="sm"
        fullWidth
        icon={<Icon className="h-4 w-4" />}
        iconPosition="left"
        className="justify-start"
      >
        {title}
      </Button>
    </Link>
  )

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statsData = stats?.data || {}
  const activityData = recentActivity?.data || []
  const deadlinesData = upcomingDeadlines?.data || []
  const progressData = projectProgress?.data || []
  const taskData = taskSummary?.data || {}
  const clientData = clientMetrics?.data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/projects/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(statsData.totalRevenue || 0)}
          change={statsData.revenueChange}
          icon={DollarSign}
          color="success"
          subtitle="All time earnings"
        />
        <StatCard
          title="Active Clients"
          value={statsData.totalClients || 0}
          change={statsData.clientsChange}
          icon={Users}
          color="accent"
          subtitle="Currently active"
        />
        <StatCard
          title="Active Projects"
          value={statsData.activeProjects || 0}
          change={statsData.projectsChange}
          icon={FolderOpen}
          color="primary"
          subtitle="In progress"
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">Recent Activity</h3>
                  <p className="card-description">
                    Latest updates from your projects and clients
                  </p>
                </div>
                <Link
                  to="/activity"
                  className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="card-content">
              {activityLoading ? (
                <LoadingSpinner />
              ) : activityData.length > 0 ? (
                <div className="space-y-0">
                  {activityData.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Progress */}
          <div className="card mt-6">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">Project Progress</h3>
                  <p className="card-description">
                    Active projects and their completion status
                  </p>
                </div>
                <Link
                  to="/projects"
                  className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="card-content">
              {progressLoading ? (
                <LoadingSpinner />
              ) : progressData.length > 0 ? (
                <div className="space-y-0">
                  {progressData.map((project) => (
                    <ProjectProgressItem key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active projects</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">Upcoming Deadlines</h3>
                  <p className="card-description">
                    Projects and tasks due soon
                  </p>
                </div>
              </div>
            </div>
            <div className="card-content">
              {deadlinesLoading ? (
                <LoadingSpinner />
              ) : deadlinesData.length > 0 ? (
                <div className="space-y-0">
                  {deadlinesData.map((deadline) => (
                    <DeadlineItem key={deadline.id} deadline={deadline} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming deadlines</p>
                </div>
              )}
            </div>
          </div>

          {/* Task Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Task Summary</h3>
            </div>
            <div className="card-content">
              {taskLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Tasks</span>
                    <span className="font-medium">{taskData.totalTasks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-medium text-success">{taskData.completedTasks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="font-medium text-warning">{taskData.pendingTasks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overdue</span>
                    <span className="font-medium text-error">{taskData.overdueTasks || 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{taskData.completionRate || 0}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content space-y-3">
              <QuickAction
                title="+ New Client"
                icon={UserPlus}
                href="/clients/new"
              />
              <QuickAction
                title="+ Create Invoice"
                icon={FilePlus}
                href="/invoices/new"
              />
              <QuickAction
                title="+ Start Project"
                icon={Play}
                href="/projects/new"
              />
              <QuickAction
                title="+ Add Task"
                icon={CheckSquare}
                href="/tasks/new"
              />
            </div>
          </div>

          {/* Client Metrics */}
          {clientData.totalClients > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Client Overview</h3>
              </div>
              <div className="card-content">
                {clientLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Clients</span>
                      <span className="font-medium">{clientData.totalClients}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Clients</span>
                      <span className="font-medium text-success">{clientData.activeClients}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">New This Month</span>
                      <span className="font-medium text-accent">{clientData.newClientsThisMonth}</span>
                    </div>
                    {clientData.topClients && clientData.topClients.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Top Clients</p>
                        <div className="space-y-2">
                          {clientData.topClients.slice(0, 3).map((client) => (
                            <div key={client.id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{client.name}</span>
                              <span className="text-muted-foreground">
                                {formatCurrency(client.totalRevenue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 