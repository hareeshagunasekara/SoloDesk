import React from 'react'
import { useQuery } from 'react-query'
import { analyticsAPI } from '../services/api'
import { cn, formatCurrency, formatDate } from '../utils/cn'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const Analytics = () => {
  const { data: analytics, isLoading } = useQuery(
    'analytics',
    analyticsAPI.getAnalytics,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const mockAnalytics = {
    totalRevenue: 125000,
    revenueChange: 18.5,
    totalClients: 45,
    clientsChange: 12.3,
    totalProjects: 67,
    projectsChange: -2.1,
    averageProjectValue: 1865,
    projectValueChange: 8.7,
    monthlyRevenue: [
      { month: 'Jan', revenue: 8500 },
      { month: 'Feb', revenue: 9200 },
      { month: 'Mar', revenue: 7800 },
      { month: 'Apr', revenue: 10500 },
      { month: 'May', revenue: 11200 },
      { month: 'Jun', revenue: 9800 },
    ],
    topClients: [
      { name: 'TechCorp', revenue: 25000, projects: 8 },
      { name: 'Design Studio', revenue: 18000, projects: 5 },
      { name: 'StartupXYZ', revenue: 15000, projects: 3 },
      { name: 'Creative Agency', revenue: 12000, projects: 4 },
      { name: 'Digital Solutions', revenue: 10000, projects: 2 },
    ],
    revenueByCategory: [
      { category: 'Web Development', revenue: 45000, percentage: 36 },
      { category: 'Design', revenue: 35000, percentage: 28 },
      { category: 'Consulting', revenue: 25000, percentage: 20 },
      { category: 'Maintenance', revenue: 15000, percentage: 12 },
      { category: 'Other', revenue: 5000, percentage: 4 },
    ],
  }

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          <div className="flex items-center mt-2">
            {change >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-success mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-error mr-1" />
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

  const ChartCard = ({ title, children, className = '' }) => (
    <div className={cn('card', className)}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  )

  const RevenueChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-card-foreground">Monthly Revenue</h4>
        <Button variant="outline" size="sm">
          Export Data
        </Button>
      </div>
      <div className="h-64 flex items-end justify-between space-x-2">
        {mockAnalytics.monthlyRevenue.map((item, index) => {
          const maxRevenue = Math.max(...mockAnalytics.monthlyRevenue.map(m => m.revenue))
          const height = (item.revenue / maxRevenue) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gradient-to-t from-[#BC96E6] to-[#FFD166] rounded-t-lg transition-all duration-300 hover:opacity-80"
                   style={{ height: `${height}%` }}>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{item.month}</p>
              <p className="text-xs font-medium text-card-foreground">${item.revenue.toLocaleString()}</p>
            </div>
          )
        })}
      </div>
    </div>
  )

  const TopClientsChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-card-foreground">Top Clients</h4>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {mockAnalytics.topClients.map((client, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BC96E6] to-[#FFD166] flex items-center justify-center text-white font-semibold text-sm">
                {client.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-card-foreground">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.projects} projects</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#BC96E6]">{formatCurrency(client.revenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const CategoryChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-card-foreground">Revenue by Category</h4>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </div>
      <div className="space-y-3">
        {mockAnalytics.revenueByCategory.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-card-foreground">{category.category}</span>
              <span className="text-sm font-semibold text-[#BC96E6]">{formatCurrency(category.revenue)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#BC96E6] to-[#FFD166] h-2 rounded-full transition-all duration-500"
                style={{ width: `${category.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">{category.percentage}% of total revenue</p>
          </div>
        ))}
      </div>
    </div>
  )

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-card-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and growth metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={<Calendar className="h-4 w-4" />}>
            Last 30 Days
          </Button>
          <Button icon={<BarChart3 className="h-4 w-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(mockAnalytics.totalRevenue)}
          change={mockAnalytics.revenueChange}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Total Clients"
          value={mockAnalytics.totalClients}
          change={mockAnalytics.clientsChange}
          icon={Users}
          color="accent"
        />
        <StatCard
          title="Total Projects"
          value={mockAnalytics.totalProjects}
          change={mockAnalytics.projectsChange}
          icon={BarChart3}
          color="primary"
        />
        <StatCard
          title="Avg Project Value"
          value={formatCurrency(mockAnalytics.averageProjectValue)}
          change={mockAnalytics.projectValueChange}
          icon={Target}
          color="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Trends" className="lg:col-span-2">
          <RevenueChart />
        </ChartCard>
        
        <ChartCard title="Top Performing Clients">
          <TopClientsChart />
        </ChartCard>
        
        <ChartCard title="Revenue by Category">
          <CategoryChart />
        </ChartCard>
      </div>
    </div>
  )
}

export default Analytics 