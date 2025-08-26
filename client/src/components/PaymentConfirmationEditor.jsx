import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { CheckCircle, Eye, EyeOff, Save, Plus, Trash2, User } from 'lucide-react'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const PaymentConfirmationEditor = ({ 
  paymentConfirmationTemplate, 
  setPaymentConfirmationTemplate,
  showPreview,
  setShowPreview,
  handleSavePaymentConfirmationTemplate,
  addNextStep,
  removeNextStep,
  updateNextStep
}) => {
  const queryClient = useQueryClient()

  // Fetch user data for email templates
  const { data: userProfile, isLoading: userLoading } = useQuery(
    'payment-confirmation-user-data',
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

  // Mock receipt data for preview
  const mockReceiptData = {
    receiptNumber: 'RCP-2024-0001',
    businessName: userProfile?.businessName || 'SoloDesk',
    businessEmail: userProfile?.email || 'contact@solodesk.com',
    businessPhone: userProfile?.phone || '+1 (555) 123-4567',
    businessWebsite: userProfile?.website || 'www.solodesk.com',
    businessAddress: userProfile?.address ? 
      `${userProfile.address.street || ''}, ${userProfile.address.city || ''}, ${userProfile.address.state || ''} ${userProfile.address.zipCode || ''}, ${userProfile.address.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',') : '123 Business St, City, State 12345',
    businessLogo: userProfile?.logo || null,
    clientName: 'John Doe',
    clientEmail: 'john.doe@example.com',
    clientPhone: '+1 (555) 987-6543',
    clientAddress: '456 Client Ave, City, State 12345',
    paymentMethod: 'Manual Payment',
    amount: 1080.00,
    currency: userProfile?.preferredCurrency || 'USD',
    paymentDate: 'January 15, 2024',
    items: [
      { description: 'Web Development Services', quantity: 1, rate: 1000.00, amount: 1000.00 }
    ]
  };

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
    const itemsList = mockReceiptData.items.map(item => 
      `<tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.rate.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.amount.toFixed(2)}</td>
      </tr>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - ${mockReceiptData.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #364153; background-color: #f9fafb; padding: 20px; }
    .receipt-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
    .header { background: #22c55e; padding: 32px 24px; text-align: center; }
    .header-content { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .logo-container { display: flex; align-items: center; }
    .business-logo { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: white; padding: 4px; }
    .logo-text { font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.02em; }
    .tagline { color: #dcfce7; font-size: 14px; font-weight: 500; margin-top: 8px; }
    .content { padding: 32px 24px; }
    .receipt-title { color: #101828; font-size: 24px; font-weight: 600; margin-bottom: 20px; text-align: center; }
    .receipt-number { color: #4a5565; font-size: 16px; font-weight: 500; margin-bottom: 24px; text-align: center; }
    .business-info { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .business-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .business-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .business-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .business-value { color: #101828; font-weight: 600; font-size: 14px; }
    .client-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .client-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .client-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .client-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .client-value { color: #101828; font-weight: 600; font-size: 14px; }
    .transaction-details { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .transaction-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; }
    .transaction-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .transaction-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .transaction-value { color: #101828; font-weight: 600; font-size: 14px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .items-table th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; color: #101828; border-bottom: 1px solid #e5e7eb; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .total-section { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .total-title { font-size: 18px; font-weight: 600; color: #101828; margin-bottom: 12px; text-align: center; }
    .total-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .total-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .total-value { color: #101828; font-weight: 600; font-size: 14px; }
    .total-final { border-top: 2px solid #22c55e; padding-top: 8px; margin-top: 8px; }
    .total-final .total-label { font-size: 16px; font-weight: 600; color: #101828; }
    .total-final .total-value { font-size: 18px; font-weight: 700; color: #22c55e; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { color: #6a7282; font-size: 13px; margin-bottom: 12px; line-height: 1.5; }
    @media (max-width: 600px) { body { padding: 12px; } .receipt-container { border-radius: 8px; } .header { padding: 24px 16px; } .content { padding: 24px 16px; } .receipt-title { font-size: 20px; } }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="header-content">
        ${mockReceiptData.businessLogo ? 
          `<div class="logo-container">
            <img src="${mockReceiptData.businessLogo}" alt="${mockReceiptData.businessName} Logo" class="business-logo" />
          </div>` : ''
        }
        <div>
          <div class="logo-text">${mockReceiptData.businessName}</div>
          <div class="tagline">Official Receipt</div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <h1 class="receipt-title">RECEIPT</h1>
      <div class="receipt-number">Receipt Number: ${mockReceiptData.receiptNumber}</div>
      
      <div class="business-info">
        <div class="business-title">Business Information</div>
        <div class="business-item">
          <span class="business-label">Business Name:</span>
          <span class="business-value">{businessName}</span>
        </div>
        <div class="business-item">
          <span class="business-label">Email:</span>
          <span class="business-value">{businessEmail}</span>
        </div>
        <div class="business-item">
          <span class="business-label">Phone:</span>
          <span class="business-value">{businessPhone}</span>
        </div>
        <div class="business-item">
          <span class="business-label">Website:</span>
          <span class="business-value">{businessWebsite}</span>
        </div>
        <div class="business-item">
          <span class="business-label">Address:</span>
          <span class="business-value">{businessAddress}</span>
        </div>
      </div>
      
      <div class="client-info">
        <div class="client-title">Client Information</div>
        <div class="client-item">
          <span class="client-label">Client Name:</span>
          <span class="client-value">{clientName}</span>
        </div>
        <div class="client-item">
          <span class="client-label">Email:</span>
          <span class="client-value">{clientEmail}</span>
        </div>
        <div class="client-item">
          <span class="client-label">Phone:</span>
          <span class="client-value">{clientPhone}</span>
        </div>
        <div class="client-item">
          <span class="client-label">Address:</span>
          <span class="client-value">{clientAddress}</span>
        </div>
      </div>
      
      <div class="transaction-details">
        <div class="transaction-title">Payment Details</div>
        <div class="transaction-item">
          <span class="transaction-label">Payment Method:</span>
          <span class="transaction-value">{paymentMethod}</span>
        </div>
        <div class="transaction-item">
          <span class="transaction-label">Payment Date:</span>
          <span class="transaction-value">{paymentDate}</span>
        </div>
        <div class="transaction-item">
          <span class="transaction-label">Receipt Number:</span>
          <span class="transaction-value">{receiptNumber}</span>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-title">Payment Summary</div>
        <div class="total-item total-final">
          <span class="total-label">Total Amount:</span>
          <span class="total-value">${mockReceiptData.currency} {amount}</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Thank you for your business!<br>
        This is an official receipt from {businessName}.<br>
        Please keep this receipt for your records.
      </p>
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
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="card-title text-lg">Receipt Template</h3>
              <p className="card-description text-sm">Customize the receipt template with business details and transaction information</p>
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
              onClick={handleSavePaymentConfirmationTemplate}
              className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
              data-save-payment-template
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

              {/* Subject Line */}
              <div>
                <label className="text-sm font-medium text-gray-700">Subject Line</label>
                <input
                  type="text"
                  value={paymentConfirmationTemplate.subject}
                  onChange={(e) => setPaymentConfirmationTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Payment Confirmation - Invoice #{invoiceNumber}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: <span className="hidden md:inline">{['{businessName}', '{businessEmail}', '{businessPhone}', '{businessWebsite}', '{businessAddress}', '{clientName}', '{clientEmail}', '{clientPhone}', '{clientAddress}', '{invoiceNumber}', '{receiptNumber}', '{amount}', '{paymentDate}', '{paymentMethod}'].join(', ')}</span>
                  <span className="hidden sm:inline md:hidden">{['{businessName}', '{businessEmail}', '{clientName}', '{amount}', '{paymentDate}'].join(', ')}...</span>
                  <span className="sm:hidden">{['{businessName}', '{clientName}', '{amount}'].join(', ')}...</span>
                </p>
              </div>

              {/* Tagline */}
              <div>
                <label className="text-sm font-medium text-gray-700">Tagline</label>
                <input
                  type="text"
                  value={paymentConfirmationTemplate.tagline}
                  onChange={(e) => setPaymentConfirmationTemplate(prev => ({ ...prev, tagline: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Thank You for Your Payment"
                />
              </div>

              {/* Thank You Section */}
              <div>
                <label className="text-sm font-medium text-gray-700">Thank You Section</label>
                <input
                  type="text"
                  value={paymentConfirmationTemplate.thankYouTitle}
                  onChange={(e) => setPaymentConfirmationTemplate(prev => ({ ...prev, thankYouTitle: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Payment Received"
                />
                <textarea
                  value={paymentConfirmationTemplate.thankYouText}
                  onChange={(e) => setPaymentConfirmationTemplate(prev => ({ ...prev, thankYouText: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="2"
                  placeholder="Thank you for your prompt payment. Your invoice has been marked as paid."
                />
              </div>

              {/* Next Steps Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Next Steps</label>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-3 w-3" />}
                    onClick={addNextStep}
                    className="text-[#f9fafb] border-gray-600 bg-gray-800 hover:bg-gray-700"
                  >
                    Add
                  </Button>
                </div>
                <input
                  type="text"
                  value={paymentConfirmationTemplate.nextStepsTitle}
                  onChange={(e) => setPaymentConfirmationTemplate(prev => ({ ...prev, nextStepsTitle: e.target.value }))}
                  className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What Happens Next"
                />
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {paymentConfirmationTemplate.nextSteps.map((step, index) => (
                    <div key={index} className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => updateNextStep(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter next step description"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-3 w-3" />}
                        onClick={() => removeNextStep(index)}
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
                  value={paymentConfirmationTemplate.text}
                  onChange={(e) => setPaymentConfirmationTemplate(prev => ({ ...prev, text: e.target.value }))}
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
              title="Receipt Preview"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentConfirmationEditor
