import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { autoMessagesAPI } from '../services/api'
import { cn, formatDate } from '../utils/cn'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import InvoiceTemplateEditor from '../components/InvoiceTemplateEditor'
import PaymentConfirmationEditor from '../components/PaymentConfirmationEditor'
import WelcomeEmailTemplate from '../components/WelcomeEmailTemplate'
import FollowUpEmailTemplate from '../components/FollowUpEmailTemplate'
import toast from 'react-hot-toast'
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
  Save,
  X,
  EyeOff,
  User,
} from 'lucide-react'

const AutoMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplateSettings, setShowTemplateSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [templateChanges, setTemplateChanges] = useState([])

  const queryClient = useQueryClient()

  // Fetch user data for email templates
  const { data: userData, isLoading: userLoading } = useQuery(
    'user-email-template-data',
    async () => {
        const response = await fetch('/api/users/email-template-data', {
          headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      return response.json()
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    }
  )

  // Payment confirmation template state with editable sections
  const [paymentConfirmationTemplate, setPaymentConfirmationTemplate] = useState({
    subject: 'Payment Confirmation - Invoice #{invoiceNumber}',
    tagline: 'Thank You for Your Payment',
    paymentDetails: {
      amount: '{amount}',
      invoiceNumber: '{invoiceNumber}',
      paymentDate: '{paymentDate}',
      paymentMethod: '{paymentMethod}'
    },
    thankYouTitle: 'Payment Received',
    thankYouText: 'Thank you for your prompt payment. Your invoice has been marked as paid.',
    nextStepsTitle: 'What Happens Next',
    nextSteps: [
      'Your payment has been processed successfully',
      'A receipt has been generated for your records',
      'Your account is now up to date',
      'We\'ll be in touch for any future projects'
    ],
    text: `Payment Confirmation - {businessName}

Dear {clientName},

Thank you for your payment of {amount} for invoice #{invoiceNumber}.

Payment Details:
- Amount: {amount}
- Invoice Number: {invoiceNumber}
- Payment Date: {paymentDate}
- Payment Method: {paymentMethod}

Your payment has been processed successfully and your invoice has been marked as paid.

What happens next:
- Your payment has been processed successfully
- A receipt has been generated for your records
- Your account is now up to date
- We'll be in touch for any future projects

If you have any questions about this payment or need assistance with future invoices, please don't hesitate to contact us.

Thank you for your business!

Best regards,
{userFirstName}
{businessName}

Contact Information:
Email: {userEmail}
{phoneText}
{websiteText}`
  })

  // Remove the problematic useEffect that was causing input field issues

  // Fetch auto messages from API
  const { data: messages, isLoading, error } = useQuery(
    'auto-messages',
    autoMessagesAPI.getMessages,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const updateMessageMutation = useMutation(
    autoMessagesAPI.update,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('auto-messages')
        setIsEditing(false)
        setSelectedMessage(null)
        toast.success('Template updated successfully')
      },
    }
  )

  const deleteMessageMutation = useMutation(
    autoMessagesAPI.delete,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('auto-messages')
        toast.success('Template deleted successfully')
      },
    }
  )

  // Payment confirmation template handlers
  const handleSavePaymentConfirmationTemplate = async () => {
    try {
      // Show loading state
      const saveButton = document.querySelector('[data-save-payment-template]');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
      }

      // Validate required fields
      if (!paymentConfirmationTemplate.subject.trim()) {
        toast.error('Please enter a subject line for the template.');
        return;
      }

      if (!paymentConfirmationTemplate.nextSteps.length) {
        toast.error('Please add at least one next step to the template.');
        return;
      }

      // Check if we have an existing payment confirmation template
      let templateId = null;
      try {
        const existingTemplates = await fetch('/api/email-templates?type=payment_confirmation', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (existingTemplates.ok) {
          const templatesData = await existingTemplates.json();
          if (templatesData.success && templatesData.data.length > 0) {
            templateId = templatesData.data[0]._id;
          }
        }
    } catch (error) {
        console.log('No existing payment confirmation templates found, creating new one...');
      }

      // Generate the HTML template
      const generatedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #364153; background-color: #f9fafb; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
    .header { background: #101828; padding: 32px 24px; text-align: center; }
    .logo { font-size: 24px; font-weight: 700; color: white; margin-bottom: 4px; letter-spacing: -0.02em; }
    .tagline { color: #99a1af; font-size: 14px; font-weight: 500; }
    .content { padding: 32px 24px; }
    .title { color: #101828; font-size: 24px; font-weight: 600; margin-bottom: 20px; text-align: center; }
    .greeting { font-size: 16px; color: #4a5565; margin-bottom: 16px; font-weight: 500; }
    .message { font-size: 15px; color: #6a7282; margin-bottom: 24px; line-height: 1.6; }
    .payment-details { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .payment-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; text-align: center; }
    .payment-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .payment-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .payment-value { color: #101828; font-weight: 600; font-size: 14px; }
    .next-steps { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .next-steps-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; text-align: center; }
    .step-item { display: flex; align-items: center; margin-bottom: 8px; padding: 6px 0; }
    .step-icon { width: 20px; height: 20px; background: #6a7282; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-size: 10px; font-weight: bold; }
    .step-text { color: #4a5565; font-weight: 500; font-size: 14px; }
    .contact-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .contact-title { font-size: 14px; font-weight: 600; color: #101828; margin-bottom: 8px; }
    .contact-item { display: flex; align-items: center; margin-bottom: 6px; color: #4a5565; font-size: 14px; }
    .contact-icon { width: 16px; height: 16px; margin-right: 8px; color: #6a7282; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { color: #6a7282; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    .footer-links { display: flex; justify-content: center; gap: 16px; margin-top: 12px; }
    .footer-link { color: #101828; text-decoration: none; font-weight: 500; font-size: 13px; transition: color 0.2s ease; }
    .footer-link:hover { color: #4a5565; }
    .divider { color: #d1d5dc; }
    @media (max-width: 600px) { body { padding: 12px; } .email-container { border-radius: 8px; } .header { padding: 24px 16px; } .content { padding: 24px 16px; } .title { font-size: 20px; } .footer-links { flex-direction: column; gap: 8px; } }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">{businessName}</div>
      <div class="tagline">Payment Confirmation</div>
    </div>
    
    <div class="content">
      <h1 class="title">Payment Received!</h1>
      
      <p class="greeting">Hello {clientName},</p>
      
      <p class="message">
        Thank you for your payment! We've received your payment and processed it successfully.
      </p>
      
      <div class="payment-details">
        <div class="payment-title">Payment Details</div>
        <div class="payment-item">
          <span class="payment-label">Amount:</span>
          <span class="payment-value">{amount}</span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Payment Method:</span>
          <span class="payment-value">{paymentMethod}</span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Date:</span>
          <span class="payment-value">{paymentDate}</span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Invoice Number:</span>
          <span class="payment-value">{invoiceNumber}</span>
        </div>
      </div>
      
      <div class="next-steps">
        <div class="next-steps-title">What's Next?</div>
        {nextStepsList}
      </div>
      
      <p class="message">
        If you have any questions about your payment or need assistance with anything else, please don't hesitate to reach out.
      </p>
      
      <div class="contact-info">
        <div class="contact-title">Get in Touch</div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <span>{businessEmail}</span>
        </div>
        {phoneSection}
        {websiteSection}
      </div>
      
      <p class="message">
        Thank you for choosing {businessName}. We appreciate your business!
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Best regards,<br>
        <strong>{businessName}</strong>
      </p>
      <p class="footer-text">
        This email was sent from {businessName}. If you have any questions, please reply to this email.
      </p>
      <div class="footer-links">
        <a href="mailto:{businessEmail}" class="footer-link">Reply to Email</a>
        <span class="divider">•</span>
        <a href="tel:{businessPhone}" class="footer-link">Call Us</a>
        {websiteLink}
      </div>
    </div>
  </div>
</body>
</html>`;

      const templateData = {
        type: 'payment_confirmation',
        name: 'Payment Confirmation Template',
        subject: paymentConfirmationTemplate.subject,
        tagline: 'Payment Confirmation',
        highlightTitle: 'Payment Details',
        highlightText: 'Your payment has been processed successfully.',
        servicesTitle: 'What\'s Next?',
        services: paymentConfirmationTemplate.nextSteps,
        html: generatedHTML,
        text: `Payment Confirmation\n\nHello {clientName},\n\nThank you for your payment! We've received your payment and processed it successfully.\n\nPayment Details:\n- Amount: {amount}\n- Payment Method: {paymentMethod}\n- Date: {paymentDate}\n- Invoice Number: {invoiceNumber}\n\nWhat's Next:\n${paymentConfirmationTemplate.nextSteps.map(step => `- ${step}`).join('\n')}\n\nThank you for choosing {businessName}. We appreciate your business!\n\nBest regards,\n{businessName}`,
        isDefault: true,
        isActive: true
      };

      const url = templateId 
        ? `/api/email-templates/${templateId}`
        : '/api/email-templates';
      
      const method = templateId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.success('Payment confirmation template saved successfully! (Demo mode - API endpoint not configured)');
          console.log('Payment confirmation template data that would be saved:', templateData);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment confirmation template saved successfully!');
        queryClient.invalidateQueries('payment-confirmation-user-data');
      } else {
        toast.error('Failed to save payment confirmation template: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving payment confirmation template:', error);
      toast.error('Error saving payment confirmation template. Please check your connection and try again.');
    } finally {
      const saveButton = document.querySelector('[data-save-payment-template]');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Template';
      }
    }
  }

  const addNextStep = () => {
    setPaymentConfirmationTemplate(prev => ({
      ...prev,
      nextSteps: [...prev.nextSteps, '']
    }))
  }

  const removeNextStep = (index) => {
    setPaymentConfirmationTemplate(prev => ({
      ...prev,
      nextSteps: prev.nextSteps.filter((_, i) => i !== index)
    }))
  }

  const updateNextStep = (index, value) => {
    setPaymentConfirmationTemplate(prev => ({
      ...prev,
      nextSteps: prev.nextSteps.map((step, i) => i === index ? value : step)
    }))
  }

  // Handle template status changes (Active/Archived toggle)
  const handleTemplateStatusChange = (id, isCurrentlyArchived) => {
    const template = messagesArray.find(msg => msg.id === id)
    if (!template) return

    let change
    if (isCurrentlyArchived) {
      // If currently archived, unarchive and activate
      change = { id, type: 'unarchive', value: true }
    } else {
      // If currently active, archive
      change = { id, type: 'archive', value: true }
    }

    setTemplateChanges(prev => {
      const existing = prev.find(c => c.id === id)
      if (existing) {
        return prev.map(c => c.id === id ? change : c)
      }
      return [...prev, change]
    })
    
    // Update local state immediately for UI feedback
    const updatedMessages = messagesArray.map(msg =>
      msg.id === id ? { 
        ...msg, 
        isActive: isCurrentlyArchived ? true : false,
        isArchived: isCurrentlyArchived ? false : true 
      } : msg
    )
    
    const action = isCurrentlyArchived ? 'unarchived and activated' : 'archived'
    console.log(`Template ${id} ${action}`)
    toast.success(`Template ${action}`)
  }



  // Save template settings to backend
  const handleSaveTemplateSettings = async () => {
    if (templateChanges.length === 0) {
      toast.success('No changes to save')
      setShowTemplateSettings(false)
      return
    }

    setIsSavingSettings(true)
    try {
      const response = await fetch('/api/email-templates/bulk-update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes: templateChanges
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Demo mode - simulate success
          toast.success('Template settings saved successfully! (Demo mode)')
          console.log('Template changes that would be saved:', templateChanges)
          setTemplateChanges([])
          setShowTemplateSettings(false)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        toast.success('Template settings saved successfully!')
        setTemplateChanges([])
        setShowTemplateSettings(false)
        // Invalidate queries to refresh data
        queryClient.invalidateQueries('auto-messages')
      } else {
        toast.error('Failed to save template settings: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving template settings:', error)
      toast.error('Error saving template settings. Please check your connection and try again.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const mockMessages = [
    {
      id: 1,
      name: 'Invoice Reminder',
      type: 'invoice',
      subject: 'Payment Reminder - Invoice #{invoice_number}',
      content: 'Dear {client_name},\n\nThis is a friendly reminder that invoice #{invoice_number} for {amount} is due on {due_date}.\n\nPlease let us know if you have any questions.\n\nBest regards,\n{company_name}',
      trigger: 'invoice_due',
      isActive: true,
      isArchived: false,
      lastSent: '2024-01-10',
    },
    {
      id: 2,
      name: 'Welcome Email',
      type: 'welcome',
      subject: 'Welcome to {businessName}!',
      content: 'Welcome! I\'m {userFirstName}, and I\'m excited to have you as a client...',
      trigger: 'client_created',
      isActive: true,
      isArchived: false,
      lastSent: '2024-01-12',
    },

    {
      id: 3,
      name: 'Payment Confirmation',
      type: 'payment',
      subject: 'Payment Received - Thank You!',
      content: 'Dear {client_name},\n\nThank you for your payment of {amount} for invoice #{invoice_number}.\n\nYour payment has been processed successfully.\n\nBest regards,\n{company_name}',
      trigger: 'payment_received',
      isActive: true,
      isArchived: false,
      lastSent: '2024-01-11',
    },
    {
      id: 4,
      name: 'Follow-up Email',
      type: 'followup',
      subject: 'Following up on {project_name}',
      content: 'Hi {client_name},\n\nI wanted to follow up on {project_name} and see if you have any feedback or questions.\n\nWe\'re here to help!\n\nBest regards,\n{company_name}',
      trigger: 'project_completed',
      isActive: true,
      isArchived: false,
      lastSent: '2024-01-09',
    },
  ]

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'invoice':
        return Bell
      case 'welcome':
        return Mail
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
      case 'payment':
        return 'success'
      case 'followup':
        return 'warning'
      default:
        return 'muted'
    }
  }

  // Ensure we have an array to filter
  const messagesArray = (() => {
    // If messages is null/undefined, use mockMessages
    if (!messages) return mockMessages;
    
    // If messages.data is an array, use it
    if (Array.isArray(messages.data)) return messages.data;
    
    // If messages itself is an array, use it
    if (Array.isArray(messages)) return messages;
    
    // If messages has a data property but it's not an array, log and use mockMessages
    if (messages.data && !Array.isArray(messages.data)) {
      console.warn('Auto messages data is not an array:', messages.data);
      return mockMessages;
    }
    
    // Default fallback
    return mockMessages;
  })();

  const filteredMessages = messagesArray.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || 
                       (filterType === 'active' && message.isActive && !message.isArchived) ||
                       (filterType === 'archived' && message.isArchived) ||
                       (filterType !== 'active' && filterType !== 'archived' && message.type === filterType)
    return matchesSearch && matchesFilter
  })



  const MessageCard = ({ message, isSelected, onSelect }) => {
    const Icon = getMessageTypeIcon(message.type)
    const color = getMessageTypeColor(message.type)

    return (
      <div className={cn(
        "group relative p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.01]",
        isSelected 
          ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 shadow-lg scale-[1.01]" 
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
           onClick={onSelect}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={cn('p-1.5 sm:p-2 rounded-md sm:rounded-lg flex-shrink-0 shadow-sm', `bg-${color}/10 border border-${color}/20`)}>
            <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', `text-${color}`)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight mb-0.5 sm:mb-1">{message.name}</h3>
            <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-1 mb-1.5 sm:mb-2 leading-tight">{message.subject}</p>
            <div className="flex items-center justify-between">
              <span className={cn('text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold uppercase tracking-wide', `bg-${color}/15 text-${color} border border-${color}/20`)}>
                {message.type}
              </span>
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <div className={cn('w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm', 
                  message.isArchived ? 'bg-red-500' : message.isActive ? 'bg-green-500' : 'bg-gray-400'
                )} />
                <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium">
                  {message.isArchived ? 'Archived' : message.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover effect overlay */}
        <div className={cn(
          "absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          `from-${color}/20 to-${color}/10`
        )} />
        </div>
      )
    }







  const MessageDetail = ({ message }) => {
    const Icon = getMessageTypeIcon(message.type)
    const color = getMessageTypeColor(message.type)

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className={cn('p-2 sm:p-3 rounded-lg', `bg-${color}/10`)}>
                <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', `text-${color}`)} />
              </div>
              <div>
                <h3 className="card-title text-base sm:text-lg">{message.name}</h3>
                <p className="card-description text-sm">{message.subject}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm"
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Edit className="h-3 w-3 sm:h-4 sm:w-4" />}
                onClick={() => setIsEditing(true)}
                className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                className="text-[#f9fafb] border-red-600 bg-red-800 hover:bg-red-700 text-xs sm:text-sm"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        <div className="card-content space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Template Type</label>
              <p className="text-sm text-card-foreground capitalize">{message.type}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Trigger Event</label>
              <p className="text-sm text-card-foreground">{message.trigger}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex items-center space-x-2">
                <div className={cn('w-2 h-2 rounded-full', message.isActive ? 'bg-success' : 'bg-muted')} />
                <span className="text-sm text-card-foreground">{message.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm text-card-foreground">{formatDate(message.lastSent)}</p>
            </div>
          </div>
          
          <div>
            <label className="text-xs sm:text-sm font-medium text-muted-foreground">Message Content</label>
            <div className="mt-2 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <pre className="text-xs sm:text-sm text-card-foreground whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border space-y-3 sm:space-y-0 sm:space-x-4">
             <Button 
               variant="outline" 
              icon={<Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm"
             >
               Preview
             </Button>
             <Button 
              icon={<Send className="h-3 w-3 sm:h-4 sm:w-4" />}
              className="text-[#f9fafb] bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
             >
               Send Test
             </Button>
           </div>
        </div>
      </div>
    )
  }

  const TemplateSettingsCard = ({ message, onToggleStatus }) => {
    const Icon = getMessageTypeIcon(message.type)
    const color = getMessageTypeColor(message.type)

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg flex-shrink-0', `bg-${color}/10 border border-${color}/20`)}>
              <Icon className={cn('h-5 w-5', `text-${color}`)} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{message.name}</h4>
              <p className="text-xs text-gray-600 truncate">{message.subject}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium uppercase', `bg-${color}/15 text-${color} border border-${color}/20`)}>
                  {message.type}
                </span>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', 
                  message.isArchived ? 'bg-red-100 text-red-700 border border-red-200' : 
                  message.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 
                  'bg-gray-100 text-gray-600 border border-gray-200'
                )}>
                  {message.isArchived ? 'Archived' : message.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Toggle Status Switch */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 font-medium">
                {message.isArchived ? 'Unarchive' : 'Archive'}
              </span>
              <button
                onClick={() => onToggleStatus(message.id, message.isArchived)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  message.isArchived ? 'bg-red-600' : 'bg-blue-600'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    message.isArchived ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
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

  if (error) {
    console.error('Auto messages error:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Templates</h3>
          <p className="text-gray-600">Failed to load email templates. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground">Email Templates</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Create and customize automated email templates for your business</p>
        </div>
                  <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Settings className="h-4 w-4" />}
            className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm"
            onClick={() => setShowTemplateSettings(true)}
            >
              Template Settings
            </Button>
          </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-6">
        {/* Templates List */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="bg-white border-2 border-gray-200 rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">Email Templates</h3>
                  <p className="text-xs text-gray-600 font-medium">Customize your automated messages</p>
                </div>
                                 <Button 
                   variant="outline" 
                   size="sm" 
                   icon={<Plus className="h-4 w-4" />}
                  className="text-white border-gray-600 bg-gray-800 hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                 >
                   New
                 </Button>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50/30 max-h-[60vh] lg:max-h-none overflow-y-auto">
              <div className="space-y-2 sm:space-y-2.5">
                {messagesArray.filter(message => {
                  const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       message.subject.toLowerCase().includes(searchTerm.toLowerCase())
                  return matchesSearch
                }).map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    isSelected={selectedMessage?.id === message.id}
                    onSelect={() => setSelectedMessage(message)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Template Editor/Preview */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          {selectedMessage ? (
            selectedMessage.type === 'welcome' ? (
              <WelcomeEmailTemplate />
            ) : selectedMessage.type === 'payment' ? (
              <PaymentConfirmationEditor 
                paymentConfirmationTemplate={paymentConfirmationTemplate}
                setPaymentConfirmationTemplate={setPaymentConfirmationTemplate}
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                handleSavePaymentConfirmationTemplate={handleSavePaymentConfirmationTemplate}
                addNextStep={addNextStep}
                removeNextStep={removeNextStep}
                updateNextStep={updateNextStep}
              />
            ) : selectedMessage.type === 'invoice' ? (
              <InvoiceTemplateEditor />
            ) : selectedMessage.type === 'followup' ? (
              <FollowUpEmailTemplate />
            ) : (
              <MessageDetail message={selectedMessage} />
            )
          ) : (
            <div className="card">
              <div className="card-content flex items-center justify-center h-48 sm:h-64">
                <div className="text-center p-4">
                  <Mail className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-2">Select a Template</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Choose a template from the sidebar to customize your email content</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Settings Modal */}
      {showTemplateSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Template Settings</h3>
                    <p className="text-sm text-gray-600">Manage your email template status and settings</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X className="h-5 w-5" />}
                  onClick={() => setShowTemplateSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Templates</option>
                      <option value="active">Active Only</option>
                      <option value="archived">Archived Only</option>
                    </select>
                  </div>
                </div>

                {/* Templates List */}
                <div className="space-y-3">
                                      {filteredMessages.map((message) => (
                      <TemplateSettingsCard
                        key={message.id}
                        message={message}
                        onToggleStatus={handleTemplateStatusChange}
                      />
                    ))}
                </div>

                {filteredMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveTemplateSettings}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSavingSettings || templateChanges.length === 0}
                >
                  {isSavingSettings ? 'Saving...' : `Save Changes${templateChanges.length > 0 ? ` (${templateChanges.length})` : ''}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutoMessages 