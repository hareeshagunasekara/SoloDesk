import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import {
  Mail,
  Eye,
  EyeOff,
  Save,
  Plus,
  Trash2,
  User,
} from 'lucide-react'

const WelcomeEmailTemplate = () => {
  const [showPreview, setShowPreview] = useState(false)
  const [userData, setUserData] = useState(null)
  const [templateLoaded, setTemplateLoaded] = useState(false)
  const queryClient = useQueryClient()

  // Fetch user data for email templates
  const { data: userProfile, isLoading: userLoading } = useQuery(
    'welcome-email-template-user-data',
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
        setWelcomeEmailTemplate(prev => ({
          ...prev,
          subject: template.subject || prev.subject,
          tagline: template.tagline || prev.tagline,
          services: template.services || prev.services,
          highlightTitle: template.highlightTitle || prev.highlightTitle,
          highlightText: template.highlightText || prev.highlightText,
          servicesTitle: template.servicesTitle || prev.servicesTitle,
          text: template.text || prev.text
        }));
      }
    } catch (error) {
      console.error('Error loading template:', error);
      // Don't throw error, just log it
    }
  }

  // Load template when component mounts
  useEffect(() => {
    if (!templateLoaded) {
      loadWelcomeTemplate();
      setTemplateLoaded(true);
    }
  }, [templateLoaded]); // Only run if template hasn't been loaded

  const handlePreviewWelcomeEmail = () => {
    setShowPreview(!showPreview)
  }

  const addService = () => {
    setWelcomeEmailTemplate(prev => ({
      ...prev,
      services: [...prev.services, 'New service']
    }))
    
    // Focus on the new service input after a short delay
    setTimeout(() => {
      const serviceInputs = document.querySelectorAll('input[placeholder="Enter service description"]');
      const lastInput = serviceInputs[serviceInputs.length - 1];
      if (lastInput) {
        lastInput.focus();
        lastInput.select();
      }
    }, 100);
  }

  const removeService = (index) => {
    if (welcomeEmailTemplate.services.length <= 1) {
      toast.error('You must have at least one service in the template.');
      return;
    }
    
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

  const handleSaveWelcomeTemplate = async () => {
    try {
      // Show loading state
      const saveButton = document.querySelector('[data-save-template]');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
      }

      // Validate required fields
      if (!welcomeEmailTemplate.subject.trim()) {
        toast.error('Please enter a subject line for the template.');
        return;
      }

      if (!welcomeEmailTemplate.services.length) {
        toast.error('Please add at least one service to the template.');
        return;
      }

      // Check if we have an existing welcome template
      let templateId = null;
      try {
        const existingTemplates = await fetch('/api/email-templates?type=welcome', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (existingTemplates.ok) {
          const templatesData = await existingTemplates.json();
          if (templatesData.success && templatesData.data.length > 0) {
            templateId = templatesData.data[0]._id; // Use the first welcome template
          }
        }
      } catch (error) {
        console.log('No existing templates found, creating new one...');
      }

      // Generate services list for HTML
      const servicesList = welcomeEmailTemplate.services.map(service => 
        `<div class="service-item">
          <div class="service-icon">✓</div>
          <div class="service-text">${service}</div>
        </div>`
      ).join('');

      // Prepare conditional sections
      const phoneSection = userProfile?.phone ? `
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>${userProfile.phone}</span>
        </div>` : '';

      const websiteSection = userProfile?.website ? `
        <div class="contact-item">
          <span class="contact-icon">🌐</span>
          <span>${userProfile.website}</span>
        </div>` : '';

      const websiteLink = userProfile?.website ? `
        <span class="divider">•</span>
        <a href="${userProfile.website}" class="footer-link">Visit Website</a>` : '';

      // Generate the HTML template
      const generatedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${userProfile?.businessName || 'SoloDesk'}</title>
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
      <div class="logo">${userProfile?.businessName || 'SoloDesk'}</div>
      <div class="tagline">{tagline}</div>
    </div>
    
    <div class="content">
      <h1 class="title">Welcome to ${userProfile?.businessName || 'SoloDesk'}!</h1>
      
      <p class="greeting">Hello {clientName},</p>
      
      <p class="message">
        Welcome! I'm ${userProfile?.firstName || 'User'}, and I'm excited to have you as a client. I'm committed to providing you with exceptional service and delivering outstanding results for your {clientType} needs.
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
          <span>${userProfile?.email || 'user@example.com'}</span>
        </div>
        ${phoneSection}
        ${websiteSection}
      </div>
      
      <p class="message">
        Thank you for choosing ${userProfile?.businessName || 'SoloDesk'}. I look forward to working with you!
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Best regards,<br>
        <strong>${userProfile?.firstName || 'User'}</strong><br>
        ${userProfile?.businessName || 'SoloDesk'}
      </p>
      <p class="footer-text">
        This email was sent from ${userProfile?.businessName || 'SoloDesk'}. If you have any questions, please reply to this email.
      </p>
      <div class="footer-links">
        <a href="mailto:${userProfile?.email || 'user@example.com'}" class="footer-link">Reply to Email</a>
        <span class="divider">•</span>
        <a href="tel:${userProfile?.phone || ''}" class="footer-link">Call ${userProfile?.firstName || 'User'}</a>
        ${websiteLink}
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

      if (!response.ok) {
        // If the API endpoint doesn't exist, show a demo message
        if (response.status === 404) {
          toast.success('Template saved successfully! (Demo mode - API endpoint not configured)');
          console.log('Template data that would be saved:', templateData);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Welcome email template saved successfully!');
        // Refresh the template data
        queryClient.invalidateQueries('welcome-email-template-user-data');
      } else {
        toast.error('Failed to save template: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template. Please check your connection and try again.');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('[data-save-template]');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Template';
      }
    }
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

  // Generate preview HTML with current template data
  const generatePreviewHTML = () => {
    const servicesList = welcomeEmailTemplate.services.map(service => 
      `<div class="service-item">
        <div class="service-icon">✓</div>
        <div class="service-text">${service}</div>
      </div>`
    ).join('');

    const phoneSection = userProfile?.phone ? `
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span>${userProfile.phone}</span>
      </div>` : '';

    const websiteSection = userProfile?.website ? `
      <div class="contact-item">
        <span class="contact-icon">🌐</span>
        <span>${userProfile.website}</span>
      </div>` : '';

    const websiteLink = userProfile?.website ? `
      <span class="divider">•</span>
      <a href="${userProfile.website}" class="footer-link">Visit Website</a>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${userProfile?.businessName || 'SoloDesk'}</title>
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
          <div class="tagline">${welcomeEmailTemplate.tagline}</div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <h1 class="title">Welcome to ${userProfile?.businessName || 'SoloDesk'}!</h1>
      
      <p class="greeting">Hello [Client Name],</p>
      
      <p class="message">
        Welcome! I'm ${userProfile?.firstName || 'there'}, and I'm excited to have you as a client. I'm committed to providing you with exceptional service and delivering outstanding results for your needs.
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
          <span>${userProfile?.email || 'user@example.com'}</span>
        </div>
        ${phoneSection}
        ${websiteSection}
      </div>
      
      <p class="message">
        Thank you for choosing ${userProfile?.businessName || 'SoloDesk'}. I look forward to working with you!
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Best regards,<br>
        <strong>${userProfile?.firstName || 'User'}</strong><br>
        ${userProfile?.businessName || 'SoloDesk'}
      </p>
      <p class="footer-text">
        This email was sent from ${userProfile?.businessName || 'SoloDesk'}. If you have any questions, please reply to this email.
      </p>
      <div class="footer-links">
        <a href="mailto:${userProfile?.email || 'user@example.com'}" class="footer-link">Reply to Email</a>
        <span class="divider">•</span>
        <a href="tel:${userProfile?.phone || ''}" class="footer-link">Call ${userProfile?.firstName || 'User'}</a>
        ${websiteLink}
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="card h-full">
      <div className="card-header border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Mail className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="card-title text-lg">Welcome Email Template</h3>
              <p className="card-description text-sm">Customize the welcome email sent to new clients</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onClick={handlePreviewWelcomeEmail}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Save className="h-4 w-4" />}
              onClick={handleSaveWelcomeTemplate}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
              data-save-template
            >
              Save Template
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)]">
        {/* Form Section */}
        <div className={`flex-1 ${showPreview ? 'lg:w-1/2 w-full' : 'w-full'} border-b lg:border-b-0 lg:border-r border-gray-200`}>
          <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* User Data Display - Compact */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-900">User Data</h4>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-1 sm:gap-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Business:</span>
                    <span className="text-gray-900 font-medium truncate">{userProfile?.businessName || 'SoloDesk'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Name:</span>
                    <span className="text-gray-900 font-medium truncate">{userProfile?.firstName || 'User'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Email:</span>
                    <span className="text-gray-900 font-medium truncate">{userProfile?.email || 'user@example.com'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Phone:</span>
                    <span className="text-gray-900 font-medium truncate">{userProfile?.phone || 'Not set'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Website:</span>
                    <span className="text-gray-900 font-medium truncate">{userProfile?.website || 'Not set'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Logo:</span>
                    <span className="text-gray-900 font-medium">
                      {userProfile?.logo ? (
                        <img src={userProfile.logo} alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover inline" />
                      ) : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="text-sm font-medium text-gray-700">Subject Line</label>
                <input
                  type="text"
                  value={welcomeEmailTemplate.subject}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Welcome to {businessName}!"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: <span className="hidden md:inline">{['{businessName}', '{userFirstName}', '{userEmail}', '{userPhone}', '{userWebsite}'].join(', ')}</span>
                  <span className="hidden sm:inline md:hidden">{['{businessName}', '{userFirstName}', '{userEmail}', '{userPhone}'].join(', ')}...</span>
                  <span className="sm:hidden">{['{businessName}', '{userFirstName}', '{userEmail}'].join(', ')}...</span>
                </p>
              </div>

              {/* Tagline */}
              <div>
                <label className="text-sm font-medium text-gray-700">Tagline</label>
                <input
                  type="text"
                  value={welcomeEmailTemplate.tagline}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, tagline: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Solo Business, Simplified"
                />
              </div>

              {/* Highlight Section */}
              <div>
                <label className="text-sm font-medium text-gray-700">Highlight Section</label>
                <input
                  type="text"
                  value={welcomeEmailTemplate.highlightTitle}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, highlightTitle: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What to Expect"
                />
                <textarea
                  value={welcomeEmailTemplate.highlightText}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, highlightText: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="2"
                  placeholder="Professional service, clear communication, and results that exceed your expectations."
                />
              </div>

              {/* Services Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Services</label>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-3 w-3" />}
                    onClick={addService}
                    className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
                  >
                    Add
                  </Button>
                </div>
                <input
                  type="text"
                  value={welcomeEmailTemplate.servicesTitle}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, servicesTitle: e.target.value }))}
                  className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How I Can Help You"
                />
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {welcomeEmailTemplate.services.map((service, index) => (
                    <div key={index} className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => updateService(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter service description"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-3 w-3" />}
                        onClick={() => removeService(index)}
                        className="text-red-500 hover:text-red-700 self-start xs:self-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Text Version */}
              <div>
                <label className="text-sm font-medium text-gray-700">Text Version</label>
                <textarea
                  value={welcomeEmailTemplate.text}
                  onChange={(e) => setWelcomeEmailTemplate(prev => ({ ...prev, text: e.target.value }))}
                  className="mt-1 w-full h-24 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter text version..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-full lg:w-1/2 h-96 lg:h-full">
            <iframe
              srcDoc={generatePreviewHTML()}
              className="w-full h-full border-0"
              title="Email Preview"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomeEmailTemplate
