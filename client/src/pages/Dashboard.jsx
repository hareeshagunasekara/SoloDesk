import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { dashboardAPI } from '../services/api'
import { cn, formatCurrency, formatDate } from '../utils/cn'
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
  Calendar,
  Plus,
  ArrowRight,
  Activity,
  Target,
  Award,
} from 'lucide-react'

const Dashboard = () => {
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

  const mockStats = {
    totalRevenue: 45250,
    revenueChange: 12.5,
    activeClients: 24,
    clientsChange: 8.2,
    activeProjects: 18,
    projectsChange: -3.1,
    completedTasks: 156,
    tasksChange: 15.7,
    totalHours: 342,
    hoursChange: 22.3,
    pendingInvoices: 8,
    invoicesChange: -5.2,
  }

  const mockRecentActivity = [
    {
      id: 1,
      type: 'project',
      title: 'Website Redesign',
      description: 'Project completed successfully',
      time: '2 hours ago',
      status: 'completed',
    },
    {
      id: 2,
      type: 'invoice',
      title: 'Invoice #INV-2024-001',
      description: 'Payment received from TechCorp',
      time: '4 hours ago',
      status: 'paid',
    },
    {
      id: 3,
      type: 'client',
      title: 'New Client Added',
      description: 'Design Studio joined as a new client',
      time: '1 day ago',
      status: 'new',
    },
    {
      id: 4,
      type: 'task',
      title: 'Logo Design',
      description: 'Task marked as completed',
      time: '2 days ago',
      status: 'completed',
    },
  ]

  const mockUpcomingDeadlines = [
    {
      id: 1,
      title: 'Brand Identity Design',
      client: 'StartupXYZ',
      dueDate: '2024-01-15',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Website Development',
      client: 'TechCorp',
      dueDate: '2024-01-18',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Marketing Materials',
      client: 'Design Studio',
      dueDate: '2024-01-20',
      priority: 'low',
    },
  ]

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
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
        </div>
        <div className={cn('p-3 rounded-lg', `bg-${color}/10`)}>
          <Icon className={cn('h-6 w-6', `text-${color}`)} />
        </div>
      </div>
    </div>
  )

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
        default:
          return Activity
      }
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed':
        case 'paid':
          return 'success'
        case 'new':
          return 'accent'
        case 'pending':
          return 'warning'
        default:
          return 'muted'
      }
    }

    const Icon = getActivityIcon(activity.type)

    return (
      <div className="notification-item">
        <div className={cn('notification-icon', `bg-${getStatusColor(activity.status)}/10`)}>
          <Icon className={cn('h-4 w-4', `text-${getStatusColor(activity.status)}`)} />
        </div>
        <div className="notification-content">
          <p className="notification-title">{activity.title}</p>
          <p className="notification-message">{activity.description}</p>
          <p className="notification-time">{activity.time}</p>
        </div>
      </div>
    )
  }

  const DeadlineItem = ({ deadline }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high':
          return 'error'
        case 'medium':
          return 'warning'
        case 'low':
          return 'success'
        default:
          return 'muted'
      }
    }

    const daysUntil = Math.ceil(
      (new Date(deadline.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    )

    return (
      <div className="task-item">
        <div className="flex items-center space-x-3">
          <div className={cn('w-2 h-2 rounded-full', `bg-${getPriorityColor(deadline.priority)}`)} />
          <div className="flex-1">
            <p className="task-title">{deadline.title}</p>
            <p className="text-xs text-muted-foreground">{deadline.client}</p>
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

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

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
          <Button variant="outline" icon={<Calendar className="h-4 w-4" />}>
            View Calendar
          </Button>
          <Button icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(mockStats.totalRevenue)}
          change={mockStats.revenueChange}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Active Clients"
          value={mockStats.activeClients}
          change={mockStats.clientsChange}
          icon={Users}
          color="accent"
        />
        <StatCard
          title="Active Projects"
          value={mockStats.activeProjects}
          change={mockStats.projectsChange}
          icon={FolderOpen}
          color="primary"
        />
        <StatCard
          title="Completed Tasks"
          value={mockStats.completedTasks}
          change={mockStats.tasksChange}
          icon={CheckSquare}
          color="success"
        />
        <StatCard
          title="Total Hours"
          value={`${mockStats.totalHours}h`}
          change={mockStats.hoursChange}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Pending Invoices"
          value={mockStats.pendingInvoices}
          change={mockStats.invoicesChange}
          icon={DollarSign}
          color="error"
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
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="card-content">
              {activityLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-0">
                  {mockRecentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">Upcoming Deadlines</h3>
                  <p className="card-description">
                    Projects and tasks due soon
                  </p>
                </div>
                <Link
                  to="/tasks"
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="card-content">
              {deadlinesLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-0">
                  {mockUpcomingDeadlines.map((deadline) => (
                    <DeadlineItem key={deadline.id} deadline={deadline} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content space-y-3">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Plus className="h-4 w-4" />}
                iconPosition="left"
              >
                New Client
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
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Clock className="h-4 w-4" />}
                iconPosition="left"
              >
                Start Timer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 