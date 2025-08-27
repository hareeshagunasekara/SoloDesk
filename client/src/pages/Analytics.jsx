import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { analyticsAPI } from '../services/api'
import { cn, formatCurrency, formatDate } from '../utils/cn'
import { exportAnalyticsReport } from '../utils/exportUtils'
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
  Download,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [chartPeriod, setChartPeriod] = useState('month')
  const [isExporting, setIsExporting] = useState(false)

  // Fetch analytics data
  const { data: analytics, isLoading, refetch, error: analyticsError } = useQuery(
    ['analytics', timeRange],
    () => analyticsAPI.getAnalytics({ period: timeRange }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        console.log('✅ Analytics data fetched successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Analytics data fetch error:', error);
      }
    }
  )

  // Fetch detailed revenue data
  const { data: revenueData, error: revenueError } = useQuery(
    ['revenue', chartPeriod],
    () => analyticsAPI.getRevenueData({ period: chartPeriod }),
    {
      staleTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        console.log('✅ Revenue data fetched successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Revenue data fetch error:', error);
      }
    }
  )

  // Fetch client metrics
  const { data: clientMetrics, error: clientError } = useQuery(
    'clientMetrics',
    () => analyticsAPI.getClientMetrics(),
    {
      staleTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        console.log('✅ Client metrics fetched successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Client metrics fetch error:', error);
      }
    }
  )

  // Fetch project metrics
  const { data: projectMetrics, error: projectError } = useQuery(
    'projectMetrics',
    () => analyticsAPI.getProjectMetrics(),
    {
      staleTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        console.log('✅ Project metrics fetched successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Project metrics fetch error:', error);
      }
    }
  )

  // Fetch time metrics
  const { data: timeMetrics, error: timeError } = useQuery(
    ['timeMetrics', timeRange],
    () => analyticsAPI.getTimeMetrics({ period: timeRange }),
    {
      staleTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        console.log('✅ Time metrics fetched successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Time metrics fetch error:', error);
      }
    }
  )

  const COLORS = ['#BC96E6', '#FFD166', '#210B2C', '#10B981', '#EF4444']

  // Enhanced StatCard with better formatting and validation
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

  // Enhanced ChartCard with better error handling
  const ChartCard = ({ title, children, className = '', actions, emptyMessage = "No data available" }) => (
    <div className={cn('bg-white rounded-xl border border-gray-100 overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </div>
      <div className="p-6">
        {children || (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">{emptyMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Enhanced RevenueChart with better data validation and formatting
  const RevenueChart = () => {
    if (!revenueDataData?.revenueOverTime || revenueDataData.revenueOverTime.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No revenue data available for the selected period</p>
          </div>
        </div>
      )
    }

    const data = revenueDataData.revenueOverTime.map(item => ({
      period: item._id,
      revenue: item.revenue || 0,
      count: item.count || 0
    }))

    const maxRevenue = Math.max(...data.map(d => d.revenue))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#BC96E6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#BC96E6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="period" 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => {
              // Format period labels based on chart period
              if (chartPeriod === 'month') {
                return new Date(value + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
              } else if (chartPeriod === 'quarter') {
                return value
              } else {
                return value
              }
            }}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => {
              if (maxRevenue >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`
              } else if (maxRevenue >= 1000) {
                return `$${(value / 1000).toFixed(0)}k`
              } else {
                return `$${value}`
              }
            }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value, name) => [
              name === 'revenue' ? `$${value.toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Transactions'
            ]}
            labelFormatter={(label) => {
              if (chartPeriod === 'month') {
                return new Date(label + '-01').toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })
              }
              return label
            }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#BC96E6" 
            strokeWidth={3}
            fill="url(#revenueGradient)"
            name="revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Enhanced TopClientsChart with better data validation
  const TopClientsChart = () => {
    if (!revenueDataData?.topClients || revenueDataData.topClients.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No client revenue data available</p>
          </div>
        </div>
      )
    }

    const data = revenueDataData.topClients.slice(0, 8).map(client => ({
      name: client.name || 'Unknown Client',
      revenue: client.totalRevenue || client.revenue || 0,
      payments: client.paymentCount || 0
    }))

    const maxRevenue = Math.max(...data.map(d => d.revenue))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            type="number"
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => {
              if (maxRevenue >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`
              } else if (maxRevenue >= 1000) {
                return `$${(value / 1000).toFixed(0)}k`
              } else {
                return `$${value}`
              }
            }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
            width={100}
            tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value, name) => [
              name === 'revenue' ? `$${value.toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Payments'
            ]}
          />
          <Bar dataKey="revenue" fill="#BC96E6" radius={[0, 4, 4, 0]} name="revenue" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Enhanced InvoiceStatusChart with better data validation and formatting
  const InvoiceStatusChart = () => {
    if (!revenueDataData) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <PieChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No invoice data available</p>
          </div>
        </div>
      )
    }

    const { paidInvoices = 0, unpaidInvoices = 0 } = revenueDataData
    const totalInvoices = paidInvoices + unpaidInvoices
    
    if (totalInvoices === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <PieChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No invoices found</p>
          </div>
        </div>
      )
    }

    const data = [
      { name: 'Paid', value: paidInvoices, color: '#10B981', percentage: totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : 0 },
      { name: 'Unpaid', value: unpaidInvoices, color: '#EF4444', percentage: totalInvoices > 0 ? ((unpaidInvoices / totalInvoices) * 100).toFixed(1) : 0 }
    ]

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value, name, props) => [
              `${value} (${props.payload.percentage}%)`,
              name
            ]}
          />
          <Legend 
            formatter={(value, entry) => (
              <span style={{ color: '#6B7280' }}>
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Enhanced ClientGrowthChart with better data validation and formatting
  const ClientGrowthChart = () => {
    if (!clientMetricsData?.clientGrowth || clientMetricsData.clientGrowth.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No client growth data available</p>
          </div>
        </div>
      )
    }

    const clientGrowth = clientMetricsData.clientGrowth || []
    const data = clientGrowth.map(item => ({
      month: item._id,
      newClients: item.newClients || 0
    }))

    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="month" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="newClients" 
            stroke="#FFD166" 
            strokeWidth={3}
            dot={{ fill: '#FFD166', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // Enhanced ProjectStatusChart with better data validation and formatting
  const ProjectStatusChart = () => {
    if (!projectMetricsData?.projectStatus || projectMetricsData.projectStatus.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No project data available</p>
          </div>
        </div>
      )
    }

    const projectStatus = projectMetricsData.projectStatus || []
    const data = projectStatus.map(item => ({
      status: item._id || 'Unknown',
      count: item.count || 0
    }))

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Enhanced TaskCompletionChart with better data validation and formatting
  const TaskCompletionChart = () => {
    if (!projectMetricsData?.taskMetrics) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No task data available</p>
          </div>
        </div>
      )
    }

    const { completedTasks = 0, pendingTasks = 0 } = projectMetricsData.taskMetrics || {}
    const totalTasks = completedTasks + pendingTasks
    
    if (totalTasks === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No tasks found</p>
          </div>
      </div>
      )
    }

    const data = [
      { 
        name: 'Completed', 
        value: completedTasks, 
        color: '#10B981',
        percentage: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
      },
      { 
        name: 'Pending', 
        value: pendingTasks, 
        color: '#F59E0B',
        percentage: totalTasks > 0 ? ((pendingTasks / totalTasks) * 100).toFixed(1) : 0
      }
    ]

          return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Enhanced TimeTrendsChart with better data validation and formatting
  const TimeTrendsChart = () => {
    if (!timeMetricsData?.revenueTrend || timeMetricsData.revenueTrend.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No trend data available</p>
              </div>
            </div>
          )
    }

    const revenueTrend = timeMetricsData.revenueTrend || []
    const data = revenueTrend.slice(-30).map(item => ({
      date: item._id,
      revenue: item.revenue || 0
    }))

    const maxRevenue = Math.max(...data.map(d => d.revenue))

    return (
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => {
              if (maxRevenue >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`
              } else if (maxRevenue >= 1000) {
                return `$${(value / 1000).toFixed(0)}k`
              } else {
                return `$${value}`
              }
            }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Bar dataKey="revenue" fill="#BC96E6" opacity={0.6} />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#FFD166" 
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  // Enhanced ActiveClientsList with better data validation and formatting
  const ActiveClientsList = () => {
    if (!clientMetricsData?.activeClients || clientMetricsData.activeClients.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No active clients data available</p>
      </div>
    </div>
  )
    }

    const activeClients = clientMetricsData.activeClients || []

    return (
      <div className="space-y-3">
        {activeClients.slice(0, 8).map((client, index) => (
          <div key={client.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BC96E6] to-[#FFD166] flex items-center justify-center text-white font-semibold text-sm">
                {client.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-xs text-gray-500">{client.projectCount} projects</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#BC96E6]">{formatCurrency(client.totalValue)}</p>
              <p className="text-xs text-gray-500">Total value</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Enhanced PerformanceMetrics with better data validation and formatting
  const PerformanceMetrics = () => {
    if (!projectMetricsData) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No performance data available</p>
          </div>
        </div>
      )
    }

    const { taskMetrics, projectDuration, deadlineMetrics } = projectMetricsData || {}

    // Add fallback values for all metrics with proper validation
    const taskCompletionRate = taskMetrics?.completionRate || 0
    const avgProjectDuration = projectDuration?.avgDuration || 0
    const deadlineSuccessRate = deadlineMetrics?.successRate || 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-soft transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{taskCompletionRate.toFixed(1)}%</p>
              <p className="text-sm font-medium text-gray-600">Task Completion</p>
            </div>
      </div>
    </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-soft transition-all duration-200">
      <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-[#210B2C]/10 text-[#210B2C]">
              <Clock className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{avgProjectDuration.toFixed(0)} days</p>
              <p className="text-sm font-medium text-gray-600">Avg Project Duration</p>
            </div>
          </div>
      </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-soft transition-all duration-200">
            <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-[#BC96E6]/10 text-[#BC96E6]">
              <Target className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{deadlineSuccessRate.toFixed(1)}%</p>
              <p className="text-sm font-medium text-gray-600">Deadline Success</p>
            </div>
          </div>
      </div>
    </div>
  )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Check for errors
  const hasErrors = analyticsError || revenueError || clientError || projectError || timeError
  if (hasErrors) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">There was an error loading the analytics data.</p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
          <div className="mt-4 text-sm text-gray-500">
            {analyticsError && <p>Analytics Error: {analyticsError.message}</p>}
            {revenueError && <p>Revenue Error: {revenueError.message}</p>}
            {clientError && <p>Client Error: {clientError.message}</p>}
            {projectError && <p>Project Error: {projectError.message}</p>}
            {timeError && <p>Time Error: {timeError.message}</p>}
          </div>
        </div>
      </div>
    )
  }

  // Show loading state if any of the required data is still loading
  const isDataLoading = isLoading || !analytics?.data || !revenueData?.data || !clientMetrics?.data || !projectMetrics?.data || !timeMetrics?.data

  // Extract data from API responses (handle the success wrapper)
  const analyticsData = analytics?.data?.data || analytics?.data || {}
  const revenueDataData = revenueData?.data?.data || revenueData?.data || {}
  const clientMetricsData = clientMetrics?.data?.data || clientMetrics?.data || {}
  const projectMetricsData = projectMetrics?.data?.data || projectMetrics?.data || {}
  const timeMetricsData = timeMetrics?.data?.data || timeMetrics?.data || {}
  


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Strategic insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#210B2C] focus:border-[#210B2C]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>

          <Button 
            icon={isExporting ? <LoadingSpinner size="sm" /> : <Download className="h-4 w-4" />}
            onClick={async () => {
              if (isExporting) return
              
              setIsExporting(true)
              try {
                // Combine all analytics data with proper structure
                const combinedData = {
                  revenue: {
                    totalRevenue: analyticsData.revenue?.totalRevenue || 0,
                    paidInvoices: revenueDataData.paidInvoices || 0,
                    unpaidInvoices: revenueDataData.unpaidInvoices || 0,
                    topClients: revenueDataData.topClients || []
                  },
                  clients: {
                    totalClients: analyticsData.clients?.totalClients || 0,
                    newClients: analyticsData.clients?.newClients || 0,
                    activeClients: analyticsData.clients?.activeClients || 0,
                    clientGrowth: clientMetricsData.clientGrowth || []
                  },
                  projects: {
                    totalProjects: analyticsData.projects?.totalProjects || 0,
                    completedProjects: analyticsData.projects?.completedProjects || 0,
                    completionRate: analyticsData.projects?.completionRate || 0,
                    avgDuration: analyticsData.projects?.avgDuration || 0,
                    projectStatus: projectMetricsData.projectStatus || [],
                    deadlineMetrics: projectMetricsData.deadlineMetrics || {}
                  },
                  tasks: {
                    totalTasks: analyticsData.tasks?.totalTasks || 0,
                    completedTasks: analyticsData.tasks?.completedTasks || 0,
                    pendingTasks: analyticsData.tasks?.pendingTasks || 0,
                    completionRate: analyticsData.tasks?.completionRate || 0,
                    taskMetrics: projectMetricsData.taskMetrics || {}
                  }
                }
                
                const result = await exportAnalyticsReport(combinedData, timeRange)
                
                if (result.success) {
                  // Show success message
                  const successMessage = document.createElement('div')
                  successMessage.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10B981;
                    color: white;
                    padding: 16px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    max-width: 300px;
                  `
                  successMessage.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                      </svg>
                      <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">Report Exported Successfully!</div>
                        <div style="font-size: 12px; opacity: 0.9;">Your analytics report has been saved to your downloads folder.</div>
                      </div>
                    </div>
                  `
                  document.body.appendChild(successMessage)
                  
                  // Remove the message after 5 seconds
                  setTimeout(() => {
                    if (successMessage.parentNode) {
                      successMessage.parentNode.removeChild(successMessage)
                    }
                  }, 5000)
                } else {
                  // Show error message
                  const errorMessage = document.createElement('div')
                  errorMessage.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #EF4444;
                    color: white;
                    padding: 16px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    max-width: 300px;
                  `
                  errorMessage.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">Export Failed</div>
                        <div style="font-size: 12px; opacity: 0.9;">Unable to generate report. Please try again.</div>
                      </div>
                    </div>
                  `
                  document.body.appendChild(errorMessage)
                  
                  // Remove the message after 5 seconds
                  setTimeout(() => {
                    if (errorMessage.parentNode) {
                      errorMessage.parentNode.removeChild(errorMessage)
                    }
                  }, 5000)
                }
              } catch (error) {
                // Show error message
                const errorMessage = document.createElement('div')
                errorMessage.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #EF4444;
                  color: white;
                  padding: 16px 24px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  z-index: 9999;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 14px;
                  max-width: 300px;
                `
                errorMessage.innerHTML = `
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <div>
                      <div style="font-weight: 600; margin-bottom: 4px;">Export Failed</div>
                      <div style="font-size: 12px; opacity: 0.9;">Something went wrong. Please try again.</div>
                    </div>
                  </div>
                `
                document.body.appendChild(errorMessage)
                
                // Remove the message after 5 seconds
                setTimeout(() => {
                  if (errorMessage.parentNode) {
                    errorMessage.parentNode.removeChild(errorMessage)
                  }
                }, 5000)
              } finally {
                setIsExporting(false)
              }
            }}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analyticsData.revenue?.totalRevenue || 0)}
          change={18.5}
          icon={DollarSign}
          color="success"
          subtitle="All time earnings"
        />
        <StatCard
          title="Total Clients"
          value={analyticsData.clients?.totalClients || 0}
          change={12.3}
          icon={Users}
          color="accent"
          subtitle="Active clients"
        />
        <StatCard
          title="Total Projects"
          value={analyticsData.projects?.totalProjects || 0}
          change={-2.1}
          icon={BarChart3}
          color="primary"
          subtitle="Completed projects"
        />
        <StatCard
          title="Task Completion"
          value={`${(analyticsData.tasks?.completionRate || 0).toFixed(1)}%`}
          change={8.7}
          icon={Target}
          color="warning"
          subtitle="Completion rate"
        />
      </div>

      {/* Main Charts Grid */}
      {isDataLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Revenue Trends" 
              className="lg:col-span-2"
              actions={
                <select
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#210B2C] focus:border-[#210B2C]"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                </select>
              }
            >
          <RevenueChart />
        </ChartCard>
        
        <ChartCard title="Top Performing Clients">
          <TopClientsChart />
        </ChartCard>
        
            <ChartCard title="Invoice Status">
              <InvoiceStatusChart />
            </ChartCard>
          </div>

          {/* Client Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Client Growth">
              <ClientGrowthChart />
            </ChartCard>
            
            <ChartCard title="Most Active Clients">
              <ActiveClientsList />
            </ChartCard>
          </div>

          {/* Project & Task Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Project Status Distribution">
              <ProjectStatusChart />
            </ChartCard>
            
            <ChartCard title="Task Completion">
              <TaskCompletionChart />
            </ChartCard>
          </div>

          {/* Performance Metrics */}
          <div className="mb-8">
            <ChartCard title="Performance Overview">
              <PerformanceMetrics />
            </ChartCard>
          </div>

          {/* Time Trends */}
          <div className="mb-8">
            <ChartCard title="Daily Revenue Trends">
              <TimeTrendsChart />
        </ChartCard>
      </div>
        </>
      )}
    </div>
  )
}

export default Analytics 