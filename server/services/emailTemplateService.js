// Email Template Service - Manages email templates separately from sending logic

// Default welcome email template
const getDefaultWelcomeEmailTemplate = () => {
  return {
    subject: 'Welcome to {businessName}!',
    html: `
      <!DOCTYPE html>
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
      </html>
    `,
    text: `
      Welcome to {businessName}!
      
      Hello {clientName},
      
      Welcome! I'm {userFirstName}, and I'm excited to have you as a client. I'm committed to providing you with exceptional service and delivering outstanding results for your {clientType} needs.
      
      What to Expect:
      - Professional service, clear communication, and results that exceed your expectations
      - Professional consultation and planning
      - Clear communication throughout the process
      - Quality deliverables on time
      - Ongoing support and follow-up
      
      I'll be in touch soon to discuss your specific needs and how I can best serve you. If you have any questions or need to reach me before then, please don't hesitate to contact me.
      
      Get in Touch:
      Email: {userEmail}
      {phoneText}
      {websiteText}
      
      Thank you for choosing {businessName}. I look forward to working with you!
      
      Best regards,
      {userFirstName}
      {businessName}
    `
  };
};

// Generate invoice email template that matches the InvoiceTemplateEditor preview
const generateInvoiceEmailTemplate = (templateData, userData, invoiceData = null) => {
  const defaultTemplate = {
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
  };

  // Merge template data with defaults
  const template = { ...defaultTemplate, ...templateData };

  // Generate items list HTML
  const itemsList = template.items.map(item => `
    <tr>
      <td class="description">${item.description}</td>
      <td>${item.quantity}</td>
      <td>${item.unitPrice}</td>
      <td class="amount">${item.amount}</td>
    </tr>
  `).join('');

  // Generate payment methods list HTML
  const paymentMethodsList = template.paymentMethods.map(method => 
    `<span class="payment-method">${method}</span>`
  ).join('');

  // Generate the HTML template
  const html = `<!DOCTYPE html>
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
      <div class="invoice-title">${template.header.title}</div>
      ${template.header.subtitle ? `<div class="invoice-subtitle">${template.header.subtitle}</div>` : ''}
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
          ${itemsList}
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
          ${paymentMethodsList}
        </div>
        ${template.paymentDescription ? `
        <div class="payment-description">
          <p class="text-sm text-gray-600 mt-3 leading-relaxed">${template.paymentDescription}</p>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <p class="footer-text">${template.footer.thankYou}</p>
        <p class="footer-text">${template.footer.terms}</p>
        <p class="footer-text">${template.footer.contact}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: template.subject,
    html: html,
    template: template
  };
};

// Generate follow-up email template
const generateFollowUpEmailTemplate = (templateData, userData, clientData) => {
  // Prepare variables
  const variables = {
    clientName: clientData.name || 'there',
    userFirstName: userData.firstName || 'there',
    userEmail: userData.email || '',
    userPhone: userData.phone || '',
    userWebsite: userData.website || '',
    businessName: userData.businessName || 'SoloDesk',
    greeting: templateData.greeting || 'Hello',
    mainMessage: templateData.mainMessage || 'Thank you for your recent business with us.',
    feedbackRequest: templateData.feedbackRequest || 'We would love to hear about your experience.',
    supportMessage: templateData.supportMessage || 'If you need any additional support, please don\'t hesitate to reach out.',
    callToAction: templateData.callToAction || 'We look forward to working with you again.',
    closing: templateData.closing || 'Best regards,',
    signature: templateData.signature || userData.firstName || 'The Team'
  };

  // Generate services list HTML
  const servicesList = templateData.services ? templateData.services.map(service => 
    `<div class="service-item">
      <div class="service-icon">✓</div>
      <div class="service-text">${service}</div>
    </div>`
  ).join('') : '';

  // Prepare conditional sections
  const phoneSection = userData.phone ? `
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span>${userData.phone}</span>
      </div>` : '';

  const websiteSection = userData.website ? `
      <div class="contact-item">
        <span class="contact-icon">🌐</span>
        <span>${userData.website}</span>
      </div>` : '';

  const websiteLink = userData.website ? `
      <span class="divider">•</span>
      <a href="${userData.website}" class="footer-link">Visit Website</a>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-up from ${userData.businessName || 'SoloDesk'}</title>
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
        <div class="logo-container">
          ${userData.logo ? `<img src="${userData.logo}" alt="${userData.businessName || 'SoloDesk'}" class="business-logo">` : ''}
          <div class="logo-text">${userData.businessName || 'SoloDesk'}</div>
        </div>
      </div>
      <div class="tagline">Follow-up from ${userData.businessName || 'SoloDesk'}</div>
    </div>
    
    <div class="content">
      <h1 class="title">Thank You!</h1>
      
      <p class="greeting">${variables.greeting} ${variables.clientName},</p>
      
      <p class="message">${variables.mainMessage}</p>
      
      <div class="highlight-box">
        <div class="highlight-title">We Value Your Feedback</div>
        <div class="highlight-text">${variables.feedbackRequest}</div>
      </div>
      
      <p class="message">${variables.supportMessage}</p>
      
      <div class="services-list">
        <div class="services-title">Additional Services We Offer</div>
        ${servicesList}
      </div>
      
      <p class="message">${variables.callToAction}</p>
      
      <div class="contact-info">
        <div class="contact-title">Get in Touch</div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <span>${userData.email}</span>
        </div>
        ${phoneSection}
        ${websiteSection}
      </div>
      
      <p class="message">${variables.closing}</p>
      <p class="message"><strong>${variables.signature}</strong></p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        <strong>${userData.businessName || 'SoloDesk'}</strong><br>
        ${userData.email}
      </p>
      <div class="footer-links">
        <a href="mailto:${userData.email}" class="footer-link">Email Us</a>
        ${websiteLink}
      </div>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: `Follow-up from ${userData.businessName || 'SoloDesk'}`,
    html: html,
    text: `Follow-up from ${userData.businessName || 'SoloDesk'}

${variables.greeting} ${variables.clientName},

${variables.mainMessage}

${variables.feedbackRequest}

${variables.supportMessage}

Additional Services:
${templateData.services ? templateData.services.map(service => `- ${service}`).join('\n') : ''}

${variables.callToAction}

${variables.closing}
${variables.signature}

${userData.businessName || 'SoloDesk'}
${userData.email}
${userData.phone || ''}
${userData.website || ''}`
  };
};

// Generate payment confirmation email template
const generatePaymentConfirmationTemplate = (templateData, userData, invoiceData) => {
  // Prepare variables
  const variables = {
    clientName: invoiceData.client || 'there',
    userFirstName: userData.firstName || 'there',
    userEmail: userData.email || '',
    userPhone: userData.phone || '',
    userWebsite: userData.website || '',
    businessName: userData.businessName || 'SoloDesk',
    amount: invoiceData.total || invoiceData.amount || '0',
    paymentMethod: invoiceData.paymentMethod || 'payment',
    paymentDate: new Date().toLocaleDateString(),
    invoiceNumber: invoiceData.number || 'N/A',
    nextStepsList: templateData.services ? templateData.services.map(service => `- ${service}`).join('\n') : ''
  };

  // Prepare conditional sections
  const phoneSection = userData.phone ? `
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span>${userData.phone}</span>
      </div>` : '';

  const websiteSection = userData.website ? `
      <div class="contact-item">
        <span class="contact-icon">🌐</span>
        <span>${userData.website}</span>
      </div>` : '';

  const websiteLink = userData.website ? `
      <span class="divider">•</span>
      <a href="${userData.website}" class="footer-link">Visit Website</a>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - ${userData.businessName || 'SoloDesk'}</title>
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
    .payment-details { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .payment-title { font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 12px; text-align: center; }
    .payment-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
    .payment-label { color: #4a5565; font-weight: 500; font-size: 14px; }
    .payment-value { color: #101828; font-weight: 600; font-size: 14px; }
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
        <div class="logo-container">
          ${userData.logo ? `<img src="${userData.logo}" alt="${userData.businessName || 'SoloDesk'}" class="business-logo">` : ''}
          <div class="logo-text">${userData.businessName || 'SoloDesk'}</div>
        </div>
      </div>
      <div class="tagline">${templateData.tagline || 'Payment Confirmation'}</div>
    </div>
    
    <div class="content">
      <h1 class="title">Payment Confirmed!</h1>
      
      <p class="greeting">Hello ${variables.clientName},</p>
      
      <p class="message">${templateData.highlightText || 'Thank you for your payment. Your transaction has been successfully processed.'}</p>
      
      <div class="highlight-box">
        <div class="highlight-title">${templateData.highlightTitle || 'Payment Successful'}</div>
        <div class="highlight-text">${templateData.highlightText || 'Your payment of $${variables.amount} has been received and processed successfully.'}</div>
      </div>
      
      <div class="payment-details">
        <div class="payment-title">Payment Details</div>
        <div class="payment-item">
          <span class="payment-label">Invoice Number:</span>
          <span class="payment-value">${variables.invoiceNumber}</span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Amount Paid:</span>
          <span class="payment-value">$${variables.amount}</span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Payment Method:</span>
          <span class="payment-value">${variables.paymentMethod}</span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Payment Date:</span>
          <span class="payment-value">${variables.paymentDate}</span>
        </div>
      </div>
      
      <div class="services-list">
        <div class="services-title">${templateData.servicesTitle || 'What\'s Next'}</div>
        ${templateData.services ? templateData.services.map(service => 
          `<div class="service-item">
            <div class="service-icon">✓</div>
            <div class="service-text">${service}</div>
          </div>`
        ).join('') : ''}
      </div>
      
      <div class="contact-info">
        <div class="contact-title">Get in Touch</div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <span>${userData.email}</span>
        </div>
        ${phoneSection}
        ${websiteSection}
      </div>
      
      <p class="message">Thank you for choosing ${userData.businessName || 'SoloDesk'}!</p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        <strong>${userData.businessName || 'SoloDesk'}</strong><br>
        ${userData.email}
      </p>
      <div class="footer-links">
        <a href="mailto:${userData.email}" class="footer-link">Email Us</a>
        ${websiteLink}
      </div>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: templateData.subject || `Payment Confirmation - ${userData.businessName || 'SoloDesk'}`,
    html: html,
    text: `Payment Confirmation - ${userData.businessName || 'SoloDesk'}

Hello ${variables.clientName},

${templateData.highlightText || 'Thank you for your payment. Your transaction has been successfully processed.'}

Payment Details:
- Invoice Number: ${variables.invoiceNumber}
- Amount Paid: $${variables.amount}
- Payment Method: ${variables.paymentMethod}
- Payment Date: ${variables.paymentDate}

What's Next:
${variables.nextStepsList}

Thank you for choosing ${userData.businessName || 'SoloDesk'}!

${userData.businessName || 'SoloDesk'}
${userData.email}
${userData.phone || ''}
${userData.website || ''}`
  };
};

// Template variables that can be used in templates
const getTemplateVariables = () => {
  return {
    client: {
      name: '{clientName}',
      email: '{clientEmail}',
      type: '{clientType}',
      company: '{clientCompany}'
    },
    user: {
      firstName: '{userFirstName}',
      lastName: '{userLastName}',
      email: '{userEmail}',
      phone: '{userPhone}',
      businessName: '{businessName}',
      website: '{userWebsite}'
    },
    business: {
      name: '{businessName}',
      website: '{userWebsite}',
      phone: '{userPhone}',
      email: '{userEmail}'
    }
  };
};

// Replace template variables with actual values
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  
  // Replace all variables
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    const value = variables[key] || '';
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return result;
};

// Get welcome email template with variables replaced
const getWelcomeEmailTemplate = (clientData, userData, templateData = null) => {
  const template = getDefaultWelcomeEmailTemplate();
  
  // Prepare variables
  const variables = {
    clientName: clientData.type === 'Company' ? clientData.companyName : clientData.name,
    clientType: clientData.type === 'Company' ? 'company' : 'individual',
    userFirstName: userData.firstName || 'there',
    userEmail: userData.email || '',
    userPhone: userData.phone || '',
    userWebsite: userData.website || '',
    businessName: userData.businessName || 'SoloDesk'
  };

  // If custom template data is provided, use it
  if (templateData) {
    // Add custom template variables
    variables.tagline = templateData.tagline || 'Your Solo Business, Simplified';
    variables.highlightTitle = templateData.highlightTitle || 'What to Expect';
    variables.highlightText = templateData.highlightText || 'Professional service, clear communication, and results that exceed your expectations.';
    variables.servicesTitle = templateData.servicesTitle || 'How I Can Help You';
    
    // Generate services list HTML
    const servicesList = templateData.services ? templateData.services.map(service => 
      `<div class="service-item">
        <div class="service-icon">✓</div>
        <div class="service-text">${service}</div>
      </div>`
    ).join('') : '';
    
    variables.servicesList = servicesList;
    variables.servicesListText = templateData.services ? templateData.services.map(service => `- ${service}`).join('\n') : '';
  } else {
    // Use default values
    variables.tagline = 'Your Solo Business, Simplified';
    variables.highlightTitle = 'What to Expect';
    variables.highlightText = 'Professional service, clear communication, and results that exceed your expectations.';
    variables.servicesTitle = 'How I Can Help You';
    variables.servicesList = `
      <div class="service-item">
        <div class="service-icon">✓</div>
        <div class="service-text">Professional consultation and planning</div>
      </div>
      <div class="service-item">
        <div class="service-icon">✓</div>
        <div class="service-text">Clear communication throughout the process</div>
      </div>
      <div class="service-item">
        <div class="service-icon">✓</div>
        <div class="service-text">Quality deliverables on time</div>
      </div>
      <div class="service-item">
        <div class="service-icon">✓</div>
        <div class="service-text">Ongoing support and follow-up</div>
      </div>`;
    variables.servicesListText = `- Professional consultation and planning
- Clear communication throughout the process
- Quality deliverables on time
- Ongoing support and follow-up`;
  }

  // Prepare conditional sections
  const phoneSection = userData.phone ? `
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span>${userData.phone}</span>
              </div>` : '';

  const websiteSection = userData.website ? `
              <div class="contact-item">
                <span class="contact-icon">🌐</span>
                <span>${userData.website}</span>
              </div>` : '';

  const websiteLink = userData.website ? `
              <span class="divider">•</span>
              <a href="${userData.website}" class="footer-link">Visit Website</a>` : '';

  const phoneText = userData.phone ? `Phone: ${userData.phone}` : '';
  const websiteText = userData.website ? `Website: ${userData.website}` : '';

  // Add conditional sections to variables
  variables.phoneSection = phoneSection;
  variables.websiteSection = websiteSection;
  variables.websiteLink = websiteLink;
  variables.phoneText = phoneText;
  variables.websiteText = websiteText;
  
  return {
    subject: replaceTemplateVariables(template.subject, variables),
    html: replaceTemplateVariables(template.html, variables),
    text: replaceTemplateVariables(template.text, variables)
  };
};

module.exports = {
  getDefaultWelcomeEmailTemplate,
  getWelcomeEmailTemplate,
  generateInvoiceEmailTemplate,
  generateFollowUpEmailTemplate,
  generatePaymentConfirmationTemplate,
  getTemplateVariables,
  replaceTemplateVariables
};
