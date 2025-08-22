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
  getTemplateVariables,
  replaceTemplateVariables
};
