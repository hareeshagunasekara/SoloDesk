import React, { useState, useEffect } from 'react'
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
  const [userData, setUserData] = useState(null)
  const queryClient = useQueryClient()

  // Fetch user data for email templates
  const { data: userProfile, isLoading: userLoading } = useQuery(
    'user-email-template-data',
    async () => {
      const response = await fetch('/api/users/email-template-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserData(data.data);
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch user data');
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Welcome email template state with editable sections
  const [welcomeEmailTemplate, setWelcomeEmailTemplate] = useState({
    subject: 'Welcome to {businessName}!',
    tagline: 'Your Solo Business, Simplified',
    services: [
      'Professional consultation and planning',
      'Clear communication throughout the process',
      'Quality deliverables on time',
      'Ongoing support and follow-up'
    ],
    highlightTitle: 'What to Expect',
    highlightText: 'Professional service, clear communication, and results that exceed your expectations.',
    servicesTitle: 'How I Can Help You',
    text: `Welcome to {businessName}!

Hello {clientName},

Welcome! I'm {userFirstName}, and I'm excited to have you as a client. I'm committed to providing you with exceptional service and delivering outstanding results for your {clientType} needs.

What to Expect:
- {highlightText}

{servicesTitle}:
{servicesListText}

I'll be in touch soon to discuss your specific needs and how I can best serve you. If you have any questions or need to reach me before then, please don't hesitate to contact me.

Get in Touch:
Email: {userEmail}
{phoneText}
{websiteText}

Thank you for choosing {businessName}. I look forward to working with you!

Best regards,
{userFirstName}
{businessName}`
  })

  // Update template when user data changes
  useEffect(() => {
    if (userData) {
      setWelcomeEmailTemplate(prev => ({
        ...prev,
        subject: `Welcome to ${userData.businessName || 'SoloDesk'}!`
      }));
    }
  }, [userData]);

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
      subject: welcomeEmailTemplate.subject,
      content: welcomeEmailTemplate.text,
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

  const handleSaveWelcomeTemplate = async () => {
    try {
      // Check if we have an existing welcome template
      const existingTemplates = await fetch('/api/email-templates?type=welcome', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const templatesData = await existingTemplates.json();
      
      let templateId = null;
      if (templatesData.success && templatesData.data.length > 0) {
        templateId = templatesData.data[0]._id; // Use the first welcome template
      }

      // Generate services list for HTML
      const servicesList = welcomeEmailTemplate.services.map(service => 
        `<div class="service-item">
          <div class="service-icon">✓</div>
          <div class="service-text">${service}</div>
        </div>`
      ).join('');

      // Generate the HTML template
      const generatedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {businessName}</title>
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
    .highlight-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; color: #101828; }
    .highlight-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .highlight-text { font-size: 14px; font-weight: 500; color: #4a5565; }
    .services-list { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .services-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; text-align: center; }
    .service-item { display: flex; align-items: center; margin-bottom: 8px; padding: 6px 0; }
    .service-icon { width: 20px; height: 20px; background: #6a7282; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-size: 10px; font-weight: bold; }
    .service-text { color: #4a5565; font-weight: 500; font-size: 14px; }
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
      <div class="tagline">{tagline}</div>
    </div>
    
    <div class="content">
      <h1 class="title">Welcome to {businessName}!</h1>
      
      <p class="greeting">Hello {clientName},</p>
      
      <p class="message">
        Welcome! I'm {userFirstName}, and I'm excited to have you as a client. I'm committed to providing you with exceptional service and delivering outstanding results for your {clientType} needs.
      </p>
      
      <div class="highlight-box">
        <div class="highlight-title">{highlightTitle}</div>
        <div class="highlight-text">
          {highlightText}
        </div>
      </div>
      
      <div class="services-list">
        <div class="services-title">{servicesTitle}</div>
        {servicesList}
      </div>
      
      <p class="message">
        I'll be in touch soon to discuss your specific needs and how I can best serve you. If you have any questions or need to reach me before then, please don't hesitate to contact me.
      </p>
      
      <div class="contact-info">
        <div class="contact-title">Get in Touch</div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <span>{userEmail}</span>
        </div>
        {phoneSection}
        {websiteSection}
      </div>
      
      <p class="message">
        Thank you for choosing {businessName}. I look forward to working with you!
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Best regards,<br>
        <strong>{userFirstName}</strong><br>
        {businessName}
      </p>
      <p class="footer-text">
        This email was sent from {businessName}. If you have any questions, please reply to this email.
      </p>
      <div class="footer-links">
        <a href="mailto:{userEmail}" class="footer-link">Reply to Email</a>
        <span class="divider">•</span>
        <a href="tel:{userPhone}" class="footer-link">Call {userFirstName}</a>
        {websiteLink}
      </div>
    </div>
  </div>
</body>
</html>`;

      const templateData = {
        type: 'welcome',
        name: 'Welcome Email Template',
        subject: welcomeEmailTemplate.subject,
        tagline: welcomeEmailTemplate.tagline,
        highlightTitle: welcomeEmailTemplate.highlightTitle,
        highlightText: welcomeEmailTemplate.highlightText,
        servicesTitle: welcomeEmailTemplate.servicesTitle,
        services: welcomeEmailTemplate.services,
        html: generatedHTML,
        text: welcomeEmailTemplate.text,
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

      const data = await response.json();
      
      if (data.success) {
        alert('Welcome email template saved successfully!');
        // Refresh the template data
        queryClient.invalidateQueries('user-email-template-data');
      } else {
        alert('Failed to save template: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    }
  }

  const loadWelcomeTemplate = async () => {
    try {
      const response = await fetch('/api/email-templates?type=welcome', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const template = data.data[0]; // Use the first welcome template
        setWelcomeEmailTemplate({
          subject: template.subject,
          tagline: template.tagline,
          services: template.services,
          highlightTitle: template.highlightTitle,
          highlightText: template.highlightText,
          servicesTitle: template.servicesTitle,
          text: template.text
        });
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }

  // Load template when component mounts
  useEffect(() => {
    loadWelcomeTemplate();
  }, []);

  const handlePreviewWelcomeEmail = () => {
    setShowPreview(!showPreview)
  }

  const addService = () => {
    setWelcomeEmailTemplate(prev => ({
      ...prev,
      services: [...prev.services, 'New service']
    }))
  }

  const removeService = (index) => {
    setWelcomeEmailTemplate(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const updateService = (index, value) => {
    setWelcomeEmailTemplate(prev => ({
      ...prev,
      services: prev.services.map((service, i) => i === index ? value : service)
    }))
  }

  const MessageCard = ({ message, isSelected, onSelect }) => {
    const Icon = getMessageTypeIcon(message.type)
    const color = getMessageTypeColor(message.type)

    return (
      <div className={cn("card hover:shadow-medium transition-all duration-200 cursor-pointer", isSelected ? "bg-accent/10" : "")}
           onClick={onSelect}>
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

  const WelcomeEmailEditor = () => {
    if (userLoading) {
      return (
        <div className="card">
          <div className="card-content flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )
    }

    // Generate preview HTML with current template data
    const generatePreviewHTML = () => {
      const servicesList = welcomeEmailTemplate.services.map(service => 
        `<div class="service-item">
          <div class="service-icon">✓</div>
          <div class="service-text">${service}</div>
        </div>`
      ).join('');

      const phoneSection = userData?.phone ? `
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>${userData.phone}</span>
        </div>` : '';

      const websiteSection = userData?.website ? `
        <div class="contact-item">
          <span class="contact-icon">🌐</span>
          <span>${userData.website}</span>
        </div>` : '';

      const websiteLink = userData?.website ? `
        <span class="divider">•</span>
        <a href="${userData.website}" class="footer-link">Visit Website</a>` : '';

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${userData?.businessName || 'SoloDesk'}</title>
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
    .highlight-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; color: #101828; }
    .highlight-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .highlight-text { font-size: 14px; font-weight: 500; color: #4a5565; }
    .services-list { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .services-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; text-align: center; }
    .service-item { display: flex; align-items: center; margin-bottom: 8px; padding: 6px 0; }
    .service-icon { width: 20px; height: 20px; background: #6a7282; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-size: 10px; font-weight: bold; }
    .service-text { color: #4a5565; font-weight: 500; font-size: 14px; }
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
      <div class="logo">${userData?.businessName || 'SoloDesk'}</div>
      <div class="tagline">${welcomeEmailTemplate.tagline}</div>
    </div>
    
    <div class="content">
      <h1 class="title">Welcome to ${userData?.businessName || 'SoloDesk'}!</h1>
      
      <p class="greeting">Hello [Client Name],</p>
      
      <p class="message">
        Welcome! I'm ${userData?.firstName || 'there'}, and I'm excited to have you as a client. I'm committed to providing you with exceptional service and delivering outstanding results for your needs.
      </p>
      
      <div class="highlight-box">
        <div class="highlight-title">${welcomeEmailTemplate.highlightTitle}</div>
        <div class="highlight-text">
          ${welcomeEmailTemplate.highlightText}
        </div>
      </div>
      
      <div class="services-list">
        <div class="services-title">${welcomeEmailTemplate.servicesTitle}</div>
        ${servicesList}
      </div>
      
      <p class="message">
        I'll be in touch soon to discuss your specific needs and how I can best serve you. If you have any questions or need to reach me before then, please don't hesitate to contact me.
      </p>
      
      <div class="contact-info">
        <div class="contact-title">Get in Touch</div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <span>${userData?.email || 'user@example.com'}</span>
        </div>
        ${phoneSection}
        ${websiteSection}
      </div>
      
      <p class="message">
        Thank you for choosing ${userData?.businessName || 'SoloDesk'}. I look forward to working with you!
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Best regards,<br>
        <strong>${userData?.firstName || 'there'}</strong><br>
        ${userData?.businessName || 'SoloDesk'}
      </p>
      <p class="footer-text">
        This email was sent from ${userData?.businessName || 'SoloDesk'}. If you have any questions, please reply to this email.
      </p>
      <div class="footer-links">
        <a href="mailto:${userData?.email || 'user@example.com'}" class="footer-link">Reply to Email</a>
        <span class="divider">•</span>
        <a href="tel:${userData?.phone || ''}" class="footer-link">Call ${userData?.firstName || 'there'}</a>
        ${websiteLink}
      </div>
    </div>
  </div>
</body>
</html>`;
    };

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="card-title">Welcome Email Template</h3>
                <p className="card-description">Customize the welcome email sent to new clients</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                onClick={handlePreviewWelcomeEmail}
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSaveWelcomeTemplate}
              >
                Save Template
              </Button>
            </div>
          </div>
        </div>
        
        <div className="card-content">
          {showPreview ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject Line</label>
                <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-card-foreground">{welcomeEmailTemplate.subject}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Preview</label>
                <div className="mt-2 border border-border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={generatePreviewHTML()}
                    className="w-full h-96 border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Data Display */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-card-foreground">User Data (Auto-filled)</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Business Name:</span>
                    <span className="ml-2 text-card-foreground">{userData?.businessName || 'SoloDesk'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 text-card-foreground">{userData?.email || 'user@example.com'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2 text-card-foreground">{userData?.phone || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Website:</span>
                    <span className="ml-2 text-card-foreground">{userData?.website || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject Line</label>
                <input
                  type="text"
                  value={welcomeEmailTemplate.subject}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Welcome to {businessName}!"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available variables: {['{businessName}', '{clientName}', '{userFirstName}'].join(', ')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                <input
                  type="text"
                  value={welcomeEmailTemplate.tagline}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, tagline: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Your Solo Business, Simplified"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Highlight Section</label>
                <div className="mt-2 space-y-3">
                  <input
                    type="text"
                    value={welcomeEmailTemplate.highlightTitle}
                    onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, highlightTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="What to Expect"
                  />
                  <textarea
                    value={welcomeEmailTemplate.highlightText}
                    onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, highlightText: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    rows="2"
                    placeholder="Professional service, clear communication, and results that exceed your expectations."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Services Section</label>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-3 w-3" />}
                    onClick={addService}
                  >
                    Add Service
                  </Button>
                </div>
                <input
                  type="text"
                  value={welcomeEmailTemplate.servicesTitle}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, servicesTitle: e.target.value }))}
                  className="mb-3 w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="How I Can Help You"
                />
                <div className="space-y-2">
                  {welcomeEmailTemplate.services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => updateService(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Enter service description"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-3 w-3" />}
                        onClick={() => removeService(index)}
                        className="text-error hover:text-error"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Text Version</label>
                <textarea
                  value={welcomeEmailTemplate.text}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, text: e.target.value }))}
                  className="mt-2 w-full h-32 px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  placeholder="Enter text version..."
                />
              </div>
            </div>
          )}
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
          <h1 className="text-2xl font-bold text-card-foreground">Email Templates</h1>
          <p className="text-muted-foreground">Manage your automated email messages</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" icon={<Settings className="h-4 w-4" />}>
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-10 gap-6">
        {/* Messages List - 30% */}
        <div className="col-span-3">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Templates</h3>
                <Button variant="outline" size="sm" icon={<Plus className="h-4 w-4" />}>
                  New
                </Button>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-2">
                {mockMessages.map((message) => (
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

        {/* Template Editor/Preview - 70% */}
        <div className="col-span-7">
          {selectedMessage ? (
            selectedMessage.type === 'welcome' ? (
              <WelcomeEmailEditor />
            ) : (
              <MessageDetail message={selectedMessage} />
            )
          ) : (
            <div className="card">
              <div className="card-content flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-card-foreground mb-2">Select a Template</h3>
                  <p className="text-muted-foreground">Choose a template from the list to start editing</p>
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