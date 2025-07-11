import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { autoMessagesAPI } from '../services/api'
import { cn, formatDate } from '../utils/cn'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Clock,
  Calendar,
  Bell,
  Mail,
  CheckCircle,
  AlertCircle,
  Settings,
  Copy,
  Search,
  Filter,
} from 'lucide-react'

const AutoMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const queryClient = useQueryClient()

  const { data: messages, isLoading } = useQuery(
    'auto-messages',
    autoMessagesAPI.getMessages,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const updateMessageMutation = useMutation(
    autoMessagesAPI.updateMessage,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('auto-messages')
        setIsEditing(false)
        setSelectedMessage(null)
      },
    }
  )

  const deleteMessageMutation = useMutation(
    autoMessagesAPI.deleteMessage,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('auto-messages')
      },
    }
  )

  const mockMessages = [
    {
      id: 1,
      name: 'Invoice Reminder',
      type: 'invoice',
      subject: 'Payment Reminder - Invoice #{invoice_number}',
      content: 'Dear {client_name},\n\nThis is a friendly reminder that invoice #{invoice_number} for {amount} is due on {due_date}.\n\nPlease let us know if you have any questions.\n\nBest regards,\n{company_name}',
      trigger: 'invoice_due',
      delay: 3,
      isActive: true,
      lastSent: '2024-01-10',
      sentCount: 45,
    },
    {
      id: 2,
      name: 'Welcome Email',
      type: 'welcome',
      subject: 'Welcome to {company_name}!',
      content: 'Hi {client_name},\n\nWelcome to {company_name}! We\'re excited to have you on board.\n\nHere\'s what you can expect from us:\n- Professional service\n- Regular updates\n- 24/7 support\n\nBest regards,\n{company_name} Team',
      trigger: 'client_created',
      delay: 0,
      isActive: true,
      lastSent: '2024-01-12',
      sentCount: 23,
    },
    {
      id: 3,
      name: 'Project Update',
      type: 'project',
      subject: 'Project Update - {project_name}',
      content: 'Hi {client_name},\n\nHere\'s an update on your project {project_name}:\n\nStatus: {project_status}\nProgress: {progress_percentage}%\n\nWe\'ll keep you updated as we progress.\n\nBest regards,\n{company_name}',
      trigger: 'project_update',
      delay: 1,
      isActive: false,
      lastSent: '2024-01-08',
      sentCount: 12,
    },
    {
      id: 4,
      name: 'Payment Confirmation',
      type: 'payment',
      subject: 'Payment Received - Thank You!',
      content: 'Dear {client_name},\n\nThank you for your payment of {amount} for invoice #{invoice_number}.\n\nYour payment has been processed successfully.\n\nBest regards,\n{company_name}',
      trigger: 'payment_received',
      delay: 0,
      isActive: true,
      lastSent: '2024-01-11',
      sentCount: 67,
    },
    {
      id: 5,
      name: 'Follow-up Email',
      type: 'followup',
      subject: 'Following up on {project_name}',
      content: 'Hi {client_name},\n\nI wanted to follow up on {project_name} and see if you have any feedback or questions.\n\nWe\'re here to help!\n\nBest regards,\n{company_name}',
      trigger: 'project_completed',
      delay: 7,
      isActive: true,
      lastSent: '2024-01-09',
      sentCount: 8,
    },
  ]

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'invoice':
        return Bell
      case 'welcome':
        return Mail
      case 'project':
        return Calendar
      case 'payment':
        return CheckCircle
      case 'followup':
        return MessageSquare
      default:
        return MessageSquare
    }
  }

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'invoice':
        return 'error'
      case 'welcome':
        return 'success'
      case 'project':
        return 'primary'
      case 'payment':
        return 'success'
      case 'followup':
        return 'warning'
      default:
        return 'muted'
    }
  }

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || message.type === filterType
    return matchesSearch && matchesFilter
  })

  const MessageCard = ({ message }) => {
    const Icon = getMessageTypeIcon(message.type)
    const color = getMessageTypeColor(message.type)

    return (
      <div className="card hover:shadow-medium transition-all duration-200 cursor-pointer"
           onClick={() => setSelectedMessage(message)}>
        <div className="card-content">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={cn('p-2 rounded-lg', `bg-${color}/10`)}>
                <Icon className={cn('h-5 w-5', `text-${color}`)} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">{message.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{message.subject}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={cn('text-xs px-2 py-1 rounded-full', `bg-${color}/10 text-${color}`)}>
                    {message.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.delay} day{message.delay !== 1 ? 's' : ''} delay
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.sentCount} sent
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={cn('w-2 h-2 rounded-full', message.isActive ? 'bg-success' : 'bg-muted')} />
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit className="h-4 w-4" />}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedMessage(message)
                  setIsEditing(true)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MessageDetail = ({ message }) => {
    const Icon = getMessageTypeIcon(message.type)
    const color = getMessageTypeColor(message.type)

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn('p-3 rounded-lg', `bg-${color}/10`)}>
                <Icon className={cn('h-6 w-6', `text-${color}`)} />
              </div>
              <div>
                <h3 className="card-title">{message.name}</h3>
                <p className="card-description">{message.subject}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Copy className="h-4 w-4" />}
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Trash2 className="h-4 w-4" />}
                className="text-error hover:text-error"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        <div className="card-content space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-sm text-card-foreground capitalize">{message.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Trigger</label>
              <p className="text-sm text-card-foreground">{message.trigger}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delay</label>
              <p className="text-sm text-card-foreground">{message.delay} day{message.delay !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex items-center space-x-2">
                <div className={cn('w-2 h-2 rounded-full', message.isActive ? 'bg-success' : 'bg-muted')} />
                <span className="text-sm text-card-foreground">{message.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Sent</label>
              <p className="text-sm text-card-foreground">{formatDate(message.lastSent)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Sent</label>
              <p className="text-sm text-card-foreground">{message.sentCount}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Message Content</label>
            <div className="mt-2 p-4 bg-muted/30 rounded-lg">
              <pre className="text-sm text-card-foreground whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" icon={<Eye className="h-4 w-4" />}>
              Preview
            </Button>
            <Button icon={<Send className="h-4 w-4" />}>
              Send Test
            </Button>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Auto-Messages</h1>
          <p className="text-muted-foreground">
            Manage your automated email templates and reminders
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="invoice">Invoice</option>
          <option value="welcome">Welcome</option>
          <option value="project">Project</option>
          <option value="payment">Payment</option>
          <option value="followup">Follow-up</option>
        </select>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-card-foreground">Templates</h2>
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div>
          {selectedMessage ? (
            <MessageDetail message={selectedMessage} />
          ) : (
            <div className="card h-full">
              <div className="card-content flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Select a Template</h3>
                  <p className="text-muted-foreground">
                    Choose a template from the list to view its details and edit settings
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AutoMessages 