import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import {
  MessageSquare,
  Eye,
  EyeOff,
  Save,
  Plus,
  Trash2,
  User,
} from 'lucide-react'

const FollowUpEmailTemplate = () => {
  const [showPreview, setShowPreview] = useState(false)
  const [userData, setUserData] = useState(null)
  const [templateLoaded, setTemplateLoaded] = useState(false)
  const queryClient = useQueryClient()

  // Fetch user data for email templates
  const { data: userProfile, isLoading: userLoading } = useQuery(
    'followup-email-template-user-data',
    async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Return mock data if API fails
        return {
          businessName: 'SoloDesk',
          email: 'user@example.com',
          phone: 'Not set',
          website: 'Not set',
          firstName: 'User',
          lastName: 'Name',
          logo: null,
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          preferredCurrency: 'USD',
          bio: '',
          freelancerType: '',
          invoicePrefix: 'INV',
          paymentTerms: '30',
          autoReminders: true,
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          socialLinks: {
            linkedin: '',
            instagram: '',
            twitter: '',
            facebook: '',
            website: ''
          }
        };
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false, // Don't retry on failure
    }
  );

  // Follow-up email template state with editable sections
  const [followUpEmailTemplate, setFollowUpEmailTemplate] = useState({
    subject: 'Following up on {project_name}',
    greeting: 'Hi {client_name},',
    mainMessage: `I wanted to follow up on {project_name} and see if you have any feedback or questions.

I hope everything is working well for you and that you're satisfied with the results.`,
    feedbackRequest: 'Your feedback is incredibly valuable to me and helps me improve my services for future clients.',
    supportMessage: 'If you need any adjustments, have questions, or would like to discuss future projects, I\'m here to help!',
    callToAction: 'Feel free to reach out anytime.',
    closing: 'Best regards,',
    signature: '{company_name}',
    additionalServices: [
      'Future project consultations',
      'Ongoing maintenance and support',
      'Referrals and recommendations',
      'Additional services and upgrades'
    ]
  })

  // Add new service
  const addService = () => {
    setFollowUpEmailTemplate(prev => ({
      ...prev,
      additionalServices: [...prev.additionalServices, 'New service']
    }))
  }

  // Remove service
  const removeService = (index) => {
    if (followUpEmailTemplate.additionalServices.length <= 1) {
      toast.error('You must have at least one service listed.')
      return
    }
    
    setFollowUpEmailTemplate(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index)
    }))
  }

  // Update service
  const updateService = (index, value) => {
    setFollowUpEmailTemplate(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.map((service, i) => 
        i === index ? value : service
      )
    }))
  }

  // Save template
  const handleSaveTemplate = async () => {
    try {
      const saveButton = document.querySelector('[data-save-followup-template]')
      if (saveButton) {
        saveButton.disabled = true
        saveButton.textContent = 'Saving...'
      }

      // Validate required fields
      if (!followUpEmailTemplate.subject.trim()) {
        toast.error('Please enter a subject line for the template.');
        return;
      }

      if (!followUpEmailTemplate.additionalServices.length) {
        toast.error('Please add at least one service to the template.');
        return;
      }

      // Check if we have an existing follow-up template
      let templateId = null;
      try {
        const existingTemplates = await fetch('/api/email-templates?type=follow_up', {
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
        console.log('No existing follow-up templates found, creating new one...');
      }

      // Generate HTML for the template
      const generatedHTML = generatePreviewHTML()

      // Generate text version for the template
      const textVersion = `Follow-up from ${userProfile?.businessName || 'SoloDesk'}

${followUpEmailTemplate.greeting}

${followUpEmailTemplate.mainMessage}

${followUpEmailTemplate.feedbackRequest}

${followUpEmailTemplate.supportMessage}

${followUpEmailTemplate.callToAction}

Additional Services:
${followUpEmailTemplate.additionalServices.map(service => `- ${service}`).join('\n')}

${followUpEmailTemplate.closing}

${followUpEmailTemplate.signature}

${userProfile?.businessName || 'SoloDesk'}
${userProfile?.email || 'contact@solodesk.com'}
${userProfile?.phone || ''}
${userProfile?.website || ''}`;

      const templateData = {
        type: 'follow_up',
        name: 'Follow-up Email Template',
        subject: followUpEmailTemplate.subject,
        tagline: 'Follow-up from ' + (userProfile?.businessName || 'SoloDesk'),
        highlightTitle: 'Additional Services',
        highlightText: 'Here are some additional services we offer that might be of interest to you.',
        servicesTitle: 'Services We Offer',
        services: followUpEmailTemplate.additionalServices,
        html: generatedHTML,
        text: textVersion,
        isDefault: true,
        isActive: true
        // Note: userId and createdBy will be added by the server controller
      }

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
      })

      if (!response.ok) {
        if (response.status === 404) {
          toast.success('Follow-up email template saved successfully! (Demo mode - API endpoint not configured)')
          console.log('Follow-up email template data that would be saved:', templateData)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        toast.success('Follow-up email template saved successfully!')
        queryClient.invalidateQueries('followup-email-template-user-data')
      } else {
        toast.error('Failed to save follow-up email template: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving follow-up email template:', error)
      toast.error('Error saving follow-up email template. Please check your connection and try again.')
    } finally {
      const saveButton = document.querySelector('[data-save-followup-template]')
      if (saveButton) {
        saveButton.disabled = false
        saveButton.textContent = 'Save Template'
      }
    }
  }

  // Generate preview HTML
  const generatePreviewHTML = () => {
    const servicesList = followUpEmailTemplate.additionalServices.map(service => `
      <div class="service-item">
        <div class="service-icon">✓</div>
        <div class="service-text">${service}</div>
      </div>`
    ).join('')

    const phoneSection = userProfile?.phone ? `
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span>${userProfile.phone}</span>
      </div>` : ''

    const websiteSection = userProfile?.website ? `
      <div class="contact-item">
        <span class="contact-icon">🌐</span>
        <span>${userProfile.website}</span>
      </div>` : ''

    const websiteLink = userProfile?.website ? `
      <span class="divider">•</span>
      <a href="${userProfile.website}" class="footer-link">Visit Website</a>` : ''

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-up from ${userProfile?.businessName || 'SoloDesk'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #364153; background-color: #f9fafb; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
    .header { background: #101828; padding: 32px 24px; text-align: center; }
    .header-content { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .logo-container { display: flex; align-items: center; }
    .business-logo { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: white; padding: 4px; }
    .logo-text { font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.02em; }
    .tagline { color: #99a1af; font-size: 14px; font-weight: 500; margin-top: 8px; }
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
      <div class="header-content">
        ${userProfile?.logo ? 
          `<div class="logo-container">
            <img src="${userProfile.logo}" alt="${userProfile?.businessName || 'SoloDesk'} Logo" class="business-logo" />
          </div>` : ''
        }
        <div>
          <div class="logo-text">${userProfile?.businessName || 'SoloDesk'}</div>
          <div class="tagline">Project Follow-up</div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <h1 class="title">Project Follow-up</h1>
      
      <p class="greeting">${followUpEmailTemplate.greeting}</p>
      
      <p class="message">
        ${followUpEmailTemplate.mainMessage}
      </p>
      
      <div class="highlight-box">
        <div class="highlight-title">${followUpEmailTemplate.feedbackRequest}</div>
        <div class="highlight-text">
          ${followUpEmailTemplate.supportMessage}
        </div>
      </div>
      
      <div class="services-list">
        <div class="services-title">Additional Services Available</div>
        ${servicesList}
      </div>
      
      <p class="message">
        ${followUpEmailTemplate.callToAction}
      </p>
      
      <div class="contact-info">
        <div class="contact-title">Get in Touch</div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <span>${userProfile?.email || 'email@example.com'}</span>
        </div>
        ${phoneSection}
        ${websiteSection}
      </div>
      
      <p class="message">
        ${followUpEmailTemplate.closing}<br>
        <strong>${followUpEmailTemplate.signature}</strong>
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">Thank you for choosing ${userProfile?.businessName || 'SoloDesk'} for your project needs.</p>
      <div class="footer-links">
        <a href="mailto:${userProfile?.email || 'email@example.com'}" class="footer-link">Contact Us</a>
        ${websiteLink}
      </div>
    </div>
  </div>
</body>
</html>`
  }

  if (userLoading) {
    return (
      <div className="card">
        <div className="card-content flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <MessageSquare className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="card-title text-sm sm:text-lg">Follow-up Email Template</h3>
              <p className="card-description text-xs sm:text-sm">Customize the follow-up email template for project completion</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={showPreview ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
              onClick={() => setShowPreview(!showPreview)}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm"
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Save className="h-3 w-3 sm:h-4 sm:w-4" />}
              onClick={handleSaveTemplate}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm"
              data-save-followup-template
            >
              Save Template
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row h-[calc(100vh-200px)] min-h-[600px]">
        {/* Form Section */}
        <div className={`flex-1 ${showPreview ? 'xl:w-1/2 w-full' : 'w-full'} border-b xl:border-b-0 xl:border-r border-gray-200`}>
          <div className="h-full overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {/* User Data Display - Compact */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">User Data</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1 text-[10px] sm:text-xs">Business:</span>
                    <span className="text-gray-900 font-medium truncate text-[10px] sm:text-xs">{userProfile?.businessName || 'SoloDesk'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1 text-[10px] sm:text-xs">Email:</span>
                    <span className="text-gray-900 font-medium truncate text-[10px] sm:text-xs">{userProfile?.email || 'user@example.com'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1 text-[10px] sm:text-xs">Phone:</span>
                    <span className="text-gray-900 font-medium truncate text-[10px] sm:text-xs">{userProfile?.phone || 'Not set'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1 text-[10px] sm:text-xs">Website:</span>
                    <span className="text-gray-900 font-medium truncate text-[10px] sm:text-xs">{userProfile?.website || 'Not set'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1 text-[10px] sm:text-xs">Address:</span>
                    <span className="text-gray-900 font-medium truncate text-[10px] sm:text-xs">
                      {userProfile?.address ? 
                        `${userProfile.address.street || ''}, ${userProfile.address.city || ''}, ${userProfile.address.state || ''} ${userProfile.address.zipCode || ''}, ${userProfile.address.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
                      : 'Not set'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1 text-[10px] sm:text-xs">Logo:</span>
                    <span className="text-gray-900 font-medium">
                      {userProfile?.logo ? (
                        <img src={userProfile.logo} alt="Logo" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded object-cover inline" />
                      ) : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Template Configuration */}
              <div className="space-y-3 sm:space-y-4">
                {/* Subject Line */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Subject Line</label>
                  <input
                    type="text"
                    value={followUpEmailTemplate.subject}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Following up on {project_name}"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Available variables: {'{project_name}, {client_name}, {company_name}'}
                  </p>
                </div>

                {/* Greeting */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Greeting</label>
                  <input
                    type="text"
                    value={followUpEmailTemplate.greeting}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, greeting: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hi {client_name},"
                  />
                </div>

                {/* Main Message */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Main Message</label>
                  <textarea
                    value={followUpEmailTemplate.mainMessage}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, mainMessage: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="3"
                    placeholder="I wanted to follow up on {project_name} and see if you have any feedback or questions..."
                  />
                </div>

                {/* Feedback Request */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Feedback Request</label>
                  <input
                    type="text"
                    value={followUpEmailTemplate.feedbackRequest}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, feedbackRequest: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your feedback is incredibly valuable to me..."
                  />
                </div>

                {/* Support Message */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Support Message</label>
                  <textarea
                    value={followUpEmailTemplate.supportMessage}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, supportMessage: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="2"
                    placeholder="If you need any adjustments, have questions, or would like to discuss future projects..."
                  />
                </div>

                {/* Call to Action */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Call to Action</label>
                  <input
                    type="text"
                    value={followUpEmailTemplate.callToAction}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, callToAction: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Feel free to reach out anytime."
                  />
                </div>

                {/* Additional Services */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Additional Services</label>
                  <div className="mt-1 sm:mt-2 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-[10px] sm:text-xs text-gray-500">List services you can offer for future projects</span>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus className="h-3 w-3" />}
                        onClick={addService}
                        className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs"
                      >
                        Add Service
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {followUpEmailTemplate.additionalServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={service}
                            onChange={(e) => updateService(index, e.target.value)}
                            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Service description"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="h-3 w-3" />}
                            onClick={() => removeService(index)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Closing */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Closing</label>
                  <input
                    type="text"
                    value={followUpEmailTemplate.closing}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, closing: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Best regards,"
                  />
                </div>

                {/* Signature */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Signature</label>
                  <input
                    type="text"
                    value={followUpEmailTemplate.signature}
                    onChange={(e) => setFollowUpEmailTemplate(prev => ({ ...prev, signature: e.target.value }))}
                    className="mt-1 sm:mt-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="{company_name}"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-full xl:w-1/2 h-80 sm:h-96 lg:h-full">
            <iframe
              srcDoc={generatePreviewHTML()}
              className="w-full h-full border-0"
              title="Follow-up Email Preview"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default FollowUpEmailTemplate
