import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import {
  Bell,
  Save,
  Plus,
  Trash2,
  User,
  Eye,
  EyeOff,
  X,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  DollarSign,
} from 'lucide-react'

const InvoiceTemplateEditor = () => {
  const queryClient = useQueryClient()
  const [showPreview, setShowPreview] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  // Fetch user data for email templates
  const { data: userProfile, isLoading: userLoading } = useQuery(
    'invoice-template-user-data',
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

  // Invoice template state with editable sections
  const [invoiceTemplate, setInvoiceTemplate] = useState({
    subject: 'Invoice #{invoiceNumber} - {businessName}',
    header: {
      title: 'INVOICE',
      subtitle: 'Professional Services'
    },
    businessDetails: {
      name: '{businessName}',
      address: '{businessAddress}',
      phone: '{businessPhone}',
      email: '{businessEmail}',
      website: '{businessWebsite}',
      logo: '{businessLogo}'
    },
    clientDetails: {
      name: '{clientName}',
      email: '{clientEmail}',
      address: '{clientAddress}',
      phone: '{clientPhone}'
    },
    invoiceDetails: {
      number: '{invoiceNumber}',
      date: '{invoiceDate}',
      dueDate: '{dueDate}',
      paymentTerms: 'Net 30 days',
      subtotal: '{subtotal}',
      taxRate: '{taxRate}',
      taxAmount: '{taxAmount}',
      total: '{total}'
    },
    items: [
      {
        description: 'Professional consultation and planning',
        quantity: '1',
        unitPrice: '{unitPrice}',
        amount: '{amount}'
      }
    ],
    paymentMethods: [
      'Bank Transfer',
      'Credit Card',
      'PayPal',
      'Check'
    ],
    paymentDescription: '',
    footer: {
      thankYou: 'Thank you for your business!',
      terms: 'Payment is due within 30 days of invoice date.',
      contact: 'If you have any questions, please contact us.'
    }
  })

  // Invoice template functions
  const addInvoiceItem = () => {
    setInvoiceTemplate(prev => ({
      ...prev,
      items: [...prev.items, {
        description: 'New item',
        quantity: '1',
        unitPrice: '0.00',
        amount: '0.00'
      }]
    }))
  }

  const removeInvoiceItem = (index) => {
    if (invoiceTemplate.items.length <= 1) {
      toast.error('You must have at least one item in the invoice.');
      return;
    }
    
    setInvoiceTemplate(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateInvoiceItem = (index, field, value) => {
    setInvoiceTemplate(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addPaymentMethod = () => {
    setInvoiceTemplate(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, 'New payment method']
    }))
  }

  const removePaymentMethod = (index) => {
    if (invoiceTemplate.paymentMethods.length <= 1) {
      toast.error('You must have at least one payment method.');
      return;
    }
    
    setInvoiceTemplate(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, i) => i !== index)
    }))
  }

  const updatePaymentMethod = (index, value) => {
    setInvoiceTemplate(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) => i === index ? value : method)
    }))
  }

  // Fetch invoices to display status
  const fetchInvoices = async () => {
    setInvoicesLoading(true)
    try {
      const response = await fetch('/api/invoices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        console.error('Failed to fetch invoices')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setInvoicesLoading(false)
    }
  }

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices()
  }, [])

  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Paid',
          color: 'success',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        }
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Pending',
          color: 'warning',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        }
      case 'overdue':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Overdue',
          color: 'error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        }
      case 'draft':
        return {
          icon: <FileText className="h-4 w-4" />,
          label: 'Draft',
          color: 'muted',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        }
      case 'sent':
        return {
          icon: <Mail className="h-4 w-4" />,
          label: 'Sent',
          color: 'info',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        }
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          label: status,
          color: 'muted',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        }
    }
  }

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount || isNaN(amount)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const generateInvoicePreview = () => {
    // Get sample invoice data for preview
    const sampleInvoice = invoices.length > 0 ? invoices[0] : null;
    const sampleStatus = sampleInvoice ? sampleInvoice.status : 'draft';
    const statusConfig = getStatusConfig(sampleStatus);
    
    // Generate items list HTML using template items or sample invoice items
    const itemsToUse = sampleInvoice && sampleInvoice.items && sampleInvoice.items.length > 0 
      ? sampleInvoice.items 
      : invoiceTemplate.items;
    
    const itemsList = itemsToUse.map(item => {
      const unitPrice = item.rate || item.unitPrice;
      const amount = item.amount;
      const currency = userProfile?.preferredCurrency || 'USD';
      
      return `
        <tr>
          <td class="description">${item.description}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(parseFloat(unitPrice) || 0, currency)}</td>
          <td class="amount">${formatCurrency(parseFloat(amount) || 0, currency)}</td>
        </tr>
      `;
    }).join('');

    // Generate payment methods list HTML
    const paymentMethodsList = invoiceTemplate.paymentMethods.map(method => 
      `<span class="payment-method">${method}</span>`
    ).join('');

    // Calculate totals for preview using sample invoice or template
    let subtotal, taxRate, taxAmount, total;
    
    if (sampleInvoice) {
      subtotal = sampleInvoice.amount || 0;
      taxRate = sampleInvoice.tax || 0;
      taxAmount = (subtotal * taxRate) / 100;
      total = sampleInvoice.total || subtotal + taxAmount;
    } else {
      subtotal = invoiceTemplate.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unitPrice.replace('$', '')) || 0;
        return sum + (quantity * price);
      }, 0);
      
      taxRate = parseFloat(invoiceTemplate.invoiceDetails.taxRate.replace('%', '')) || 0;
      taxAmount = subtotal * (taxRate / 100);
      total = subtotal + taxAmount;
    }

    // Generate the HTML template with real invoice data
    const previewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #364153; background-color: #f9fafb; padding: 20px; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
    .header { background: #101828; padding: 32px 24px; text-align: center; }
    .logo { font-size: 24px; font-weight: 700; color: white; margin-bottom: 4px; letter-spacing: -0.02em; }
    .invoice-title { color: #99a1af; font-size: 14px; font-weight: 500; }
    .content { padding: 32px 24px; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .business-info, .client-info { flex: 1; }
    .business-info { margin-right: 32px; }
    .info-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .info-item { font-size: 14px; color: #4a5565; margin-bottom: 4px; }
    .invoice-details { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .invoice-number { font-size: 18px; font-weight: 600; color: #101828; margin-bottom: 8px; }
    .invoice-date { font-size: 14px; color: #4a5565; }
    .invoice-status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-left: 12px; }
    .status-draft { background: #f3f4f6; color: #6b7280; }
    .status-sent { background: #dbeafe; color: #1d4ed8; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-paid { background: #d1fae5; color: #059669; }
    .status-overdue { background: #fef2f2; color: #dc2626; }
    .status-draft { background: #f3f4f6; color: #374151; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #101828; border-bottom: 1px solid #e5e7eb; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4a5565; }
    .items-table .description { font-weight: 500; color: #101828; }
    .items-table .amount { text-align: right; font-weight: 600; }
    .totals { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .total-row:last-child { margin-bottom: 0; border-top: 1px solid #e5e7eb; padding-top: 12px; font-weight: 600; font-size: 16px; color: #101828; }
    .payment-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .payment-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .payment-methods { display: flex; flex-wrap: wrap; gap: 8px; }
    .payment-method { background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #4a5565; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { color: #6a7282; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    @media (max-width: 600px) { body { padding: 12px; } .invoice-container { border-radius: 8px; } .header { padding: 24px 16px; } .content { padding: 24px 16px; } .invoice-header { flex-direction: column; } .business-info { margin-right: 0; margin-bottom: 24px; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo">
        ${userProfile?.logo ? `<img src="${userProfile.logo}" alt="Logo" style="max-height: 40px; max-width: 120px; object-fit: contain;" />` : (userProfile?.businessName || 'Your Business Name')}
      </div>
      <div class="invoice-title">${invoiceTemplate.header.title || 'INVOICE'}</div>
      ${invoiceTemplate.header.subtitle ? `<div class="invoice-subtitle">${invoiceTemplate.header.subtitle}</div>` : ''}
    </div>
    
    <div class="content">
      <div class="invoice-header">
        <div class="business-info">
          <div class="info-title">From:</div>
          <div class="info-item">${userProfile?.businessName || 'Your Business Name'}</div>
          <div class="info-item">${userProfile?.address ? 
            `${userProfile.address.street || ''}, ${userProfile.address.city || ''}, ${userProfile.address.state || ''} ${userProfile.address.zipCode || ''}, ${userProfile.address.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
          : 'Address not set'}</div>
          <div class="info-item">${userProfile?.phone || 'Phone not set'}</div>
          <div class="info-item">${userProfile?.email || 'Email not set'}</div>
          <div class="info-item">${userProfile?.website || 'Website not set'}</div>
        </div>
        <div class="client-info">
          <div class="info-title">To:</div>
          <div class="info-item">${sampleInvoice ? sampleInvoice.client : (invoiceTemplate.clientDetails.name || 'Client Name')}</div>
          <div class="info-item">${sampleInvoice ? sampleInvoice.clientEmail : (invoiceTemplate.clientDetails.email || 'client@example.com')}</div>
          <div class="info-item">${invoiceTemplate.clientDetails.address || '456 Client Ave, City, State 67890'}</div>
          <div class="info-item">${invoiceTemplate.clientDetails.phone || '(555) 987-6543'}</div>
        </div>
      </div>

      <div class="invoice-details">
        <div class="invoice-number">
          Invoice #${sampleInvoice ? sampleInvoice.number : 'INV-2024-001'}
          <span class="invoice-status status-${sampleStatus}">
            ${statusConfig.label}
          </span>
        </div>
        <div class="invoice-date">
          Date: ${sampleInvoice ? formatDate(sampleInvoice.issueDate) : new Date().toLocaleDateString()} | 
          Due Date: ${sampleInvoice ? formatDate(sampleInvoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal, userProfile?.preferredCurrency || 'USD')}</span>
        </div>
        ${taxRate > 0 ? `
        <div class="total-row">
          <span>Tax (${taxRate}%):</span>
          <span>${formatCurrency(taxAmount, userProfile?.preferredCurrency || 'USD')}</span>
        </div>
        ` : ''}
        <div class="total-row">
          <span>Total:</span>
          <span>${formatCurrency(total, userProfile?.preferredCurrency || 'USD')}</span>
        </div>
      </div>

      <div class="payment-info">
        <div class="payment-title">Payment Methods</div>
        <div class="payment-methods">
          ${paymentMethodsList}
        </div>
        ${invoiceTemplate.paymentDescription ? `
        <div class="payment-description">
          <p class="text-sm text-gray-600 mt-3 leading-relaxed">${invoiceTemplate.paymentDescription}</p>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <p class="footer-text">${invoiceTemplate.footer.thankYou}</p>
        <p class="footer-text">${invoiceTemplate.footer.terms}</p>
        <p class="footer-text">${invoiceTemplate.footer.contact}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    return previewHTML;
  };

  const handleSaveInvoiceTemplate = async () => {
    try {
      // Show loading state
      const saveButton = document.querySelector('[data-save-invoice-template]');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
      }

      // Validate required fields
      if (!invoiceTemplate.subject.trim()) {
        toast.error('Please enter a subject line for the invoice template.');
        return;
      }

      if (!invoiceTemplate.items.length) {
        toast.error('Please add at least one item to the invoice template.');
        return;
      }

      // Check if we have an existing invoice template
      let templateId = null;
      try {
        const existingTemplates = await fetch('/api/email-templates?type=invoice', {
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
        console.log('No existing invoice templates found, creating new one...');
      }

      // Generate the HTML template
      const generatedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #{invoiceNumber} - {businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #364153; background-color: #f9fafb; padding: 20px; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
    .header { background: #101828; padding: 32px 24px; text-align: center; }
    .logo { font-size: 24px; font-weight: 700; color: white; margin-bottom: 4px; letter-spacing: -0.02em; }
    .invoice-title { color: #99a1af; font-size: 14px; font-weight: 500; }
    .content { padding: 32px 24px; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .business-info, .client-info { flex: 1; }
    .business-info { margin-right: 32px; }
    .info-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .info-item { font-size: 14px; color: #4a5565; margin-bottom: 4px; }
    .invoice-details { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .invoice-number { font-size: 18px; font-weight: 600; color: #101828; margin-bottom: 8px; }
    .invoice-date { font-size: 14px; color: #4a5565; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #101828; border-bottom: 1px solid #e5e7eb; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4a5565; }
    .items-table .description { font-weight: 500; color: #101828; }
    .items-table .amount { text-align: right; font-weight: 600; }
    .totals { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .total-row:last-child { margin-bottom: 0; border-top: 1px solid #e5e7eb; padding-top: 12px; font-weight: 600; font-size: 16px; color: #101828; }
    .payment-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .payment-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .payment-methods { display: flex; flex-wrap: wrap; gap: 8px; }
    .payment-method { background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #4a5565; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { color: #6a7282; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    @media (max-width: 600px) { body { padding: 12px; } .invoice-container { border-radius: 8px; } .header { padding: 24px 16px; } .content { padding: 24px 16px; } .invoice-header { flex-direction: column; } .business-info { margin-right: 0; margin-bottom: 24px; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo">{businessName}</div>
      <div class="invoice-title">INVOICE</div>
    </div>
    
    <div class="content">
      <div class="invoice-header">
        <div class="business-info">
          <div class="info-title">From:</div>
          <div class="info-item">{businessName}</div>
          <div class="info-item">{businessAddress}</div>
          <div class="info-item">{businessPhone}</div>
          <div class="info-item">{businessEmail}</div>
          <div class="info-item">{businessWebsite}</div>
        </div>
        <div class="client-info">
          <div class="info-title">To:</div>
          <div class="info-item">{clientName}</div>
          <div class="info-item">{clientEmail}</div>
          <div class="info-item">{clientAddress}</div>
          <div class="info-item">{clientPhone}</div>
        </div>
      </div>

      <div class="invoice-details">
        <div class="invoice-number">Invoice #{invoiceNumber}</div>
        <div class="invoice-date">Date: {invoiceDate} | Due Date: {dueDate}</div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {itemsList}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>{subtotal}</span>
        </div>
        <div class="total-row">
          <span>Tax ({taxRate}%):</span>
          <span>{taxAmount}</span>
        </div>
        <div class="total-row">
          <span>Total:</span>
          <span>{total}</span>
        </div>
      </div>

      <div class="payment-info">
        <div class="payment-title">Payment Methods</div>
        <div class="payment-methods">
          {paymentMethodsList}
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">{thankYou}</p>
        <p class="footer-text">{terms}</p>
        <p class="footer-text">{contact}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

      const templateData = {
        type: 'invoice',
        name: 'Invoice Template',
        subject: invoiceTemplate.subject,
        header: invoiceTemplate.header,
        businessDetails: invoiceTemplate.businessDetails,
        clientDetails: invoiceTemplate.clientDetails,
        invoiceDetails: invoiceTemplate.invoiceDetails,
        items: invoiceTemplate.items,
        paymentMethods: invoiceTemplate.paymentMethods,
        paymentDescription: invoiceTemplate.paymentDescription,
        footer: invoiceTemplate.footer,
        html: generatedHTML,
        text: 'Invoice template text content', // Add text field which is required
        isDefault: true,
        isActive: true
        // Note: userId and createdBy will be added by the server controller
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
          toast.success('Invoice template saved successfully! (Demo mode - API endpoint not configured)');
          console.log('Invoice template data that would be saved:', templateData);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Invoice template saved successfully!');
        queryClient.invalidateQueries('user-email-template-data');
      } else {
        toast.error('Failed to save invoice template: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving invoice template:', error);
      toast.error('Error saving invoice template. Please check your connection and try again.');
    } finally {
      const saveButton = document.querySelector('[data-save-invoice-template]');
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

  return (
    <div className="card">
      <div className="card-header border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-error/10">
              <Bell className="h-5 w-5 text-error" />
            </div>
            <div>
              <h3 className="card-title text-lg">Invoice Template</h3>
              <p className="card-description text-sm">Customize the invoice template for your business</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onClick={() => setShowPreview(!showPreview)}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Save className="h-4 w-4" />}
              onClick={handleSaveInvoiceTemplate}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
              data-save-invoice-template
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
                    <span className="text-gray-600 sm:mr-1">Address:</span>
                    <span className="text-gray-900 font-medium truncate">
                      {userProfile?.address ? 
                        `${userProfile.address.street || ''}, ${userProfile.address.city || ''}, ${userProfile.address.state || ''} ${userProfile.address.zipCode || ''}, ${userProfile.address.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
                      : 'Not set'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Logo:</span>
                    <span className="text-gray-900 font-medium">
                      {userProfile?.logo ? (
                        <img src={userProfile.logo} alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover inline" />
                      ) : 'Not set'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 sm:mr-1">Currency:</span>
                    <span className="text-gray-900 font-medium">{userProfile?.preferredCurrency || 'USD'}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Status Overview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-900">Invoice Status Overview</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchInvoices}
                    disabled={invoicesLoading}
                    className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
                  >
                    {invoicesLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
                
                {invoicesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="space-y-3">
                    {/* Status Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['draft', 'sent', 'pending', 'paid', 'overdue'].map(status => {
                        const count = invoices.filter(inv => inv.status === status).length
                        const statusConfig = getStatusConfig(status)
                        return count > 0 ? (
                          <div key={status} className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200">
                            <div className={`p-1 rounded-full ${statusConfig.bgColor}`}>
                              {statusConfig.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{statusConfig.label}</p>
                              <p className="text-xs text-gray-500">{count} invoice{count !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                    
                    {/* Recent Invoices */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Recent Invoices</h5>
                      <div className="space-y-2">
                        {invoices.slice(0, 3).map((invoice, index) => (
                          <div key={invoice._id || `invoice-${index}`} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{invoice.number}</p>
                              <p className="text-xs text-gray-500">{invoice.client?.name || 'Unknown Client'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(invoice.status).bgColor} ${getStatusConfig(invoice.status).textColor}`}>
                                {getStatusConfig(invoice.status).label}
                              </span>
                              <span className="text-xs font-medium text-gray-900">
                                {userProfile?.preferredCurrency || 'USD'} {invoice.total?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No invoices found</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first invoice to see it here</p>
                  </div>
                )}
              </div>

              {/* Template Configuration */}
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Header Text</label>
                  <div className="mt-2 space-y-3">
                    <input
                      type="text"
                      value={invoiceTemplate.header.title}
                      onChange={(e) => setInvoiceTemplate(prev => ({
                        ...prev,
                        header: { ...prev.header, title: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Invoice title"
                    />
                    <input
                      type="text"
                      value={invoiceTemplate.header.subtitle}
                      onChange={(e) => setInvoiceTemplate(prev => ({
                        ...prev,
                        header: { ...prev.header, subtitle: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Invoice subtitle"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Methods</label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Add payment methods that will appear on the invoice</span>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus className="h-3 w-3" />}
                        onClick={addPaymentMethod}
                        className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
                      >
                        Add Method
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {invoiceTemplate.paymentMethods.map((method, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={method}
                            onChange={(e) => updatePaymentMethod(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Payment method"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="h-3 w-3" />}
                            onClick={() => removePaymentMethod(index)}
                            className="text-red-500 hover:text-red-700"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Payment Description */}
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">Payment Description (Optional)</label>
                      <textarea
                        value={invoiceTemplate.paymentDescription}
                        onChange={(e) => setInvoiceTemplate(prev => ({ ...prev, paymentDescription: e.target.value }))}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows="3"
                        placeholder="Add additional payment instructions, account details, or special payment terms..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This description will appear below the payment methods in the invoice
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Footer Text</label>
                  <div className="mt-2 space-y-3">
                    <input
                      type="text"
                      value={invoiceTemplate.footer.thankYou}
                      onChange={(e) => setInvoiceTemplate(prev => ({
                        ...prev,
                        footer: { ...prev.footer, thankYou: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Thank you message"
                    />
                    <input
                      type="text"
                      value={invoiceTemplate.footer.terms}
                      onChange={(e) => setInvoiceTemplate(prev => ({
                        ...prev,
                        footer: { ...prev.footer, terms: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Payment terms"
                    />
                    <input
                      type="text"
                      value={invoiceTemplate.footer.contact}
                      onChange={(e) => setInvoiceTemplate(prev => ({
                        ...prev,
                        footer: { ...prev.footer, contact: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contact information"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-full lg:w-1/2 h-96 lg:h-full">
            <iframe
              srcDoc={generateInvoicePreview()}
              className="w-full h-full border-0"
              title="Invoice Preview"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceTemplateEditor
