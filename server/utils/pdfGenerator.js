// Try to use puppeteer, fallback to simple HTML if not available
let puppeteer = null;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.log('Puppeteer not available, PDF generation will be limited');
}

// Generate PDF from HTML content
const generatePDFFromHTML = async (htmlContent, options = {}) => {
  if (!puppeteer) {
    throw new Error('Puppeteer not available for PDF generation');
  }

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      ...options
    });

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Generate invoice PDF HTML
const generateInvoiceHTML = (invoice, user, emailTemplate = null) => {
  // Calculate totals
  const subtotal = invoice.amount || 0;
  const taxRate = invoice.tax || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = invoice.total || subtotal + taxAmount;

  // Generate items list
  const itemsList = invoice.items && invoice.items.length > 0 
    ? invoice.items.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #101828;">${item.description}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #4a5565;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #4a5565;">$${item.rate}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">$${item.amount}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #101828;">Services</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #4a5565;">1</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #4a5565;">$${subtotal.toFixed(2)}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">$${subtotal.toFixed(2)}</td>
        </tr>
      `;

  // Generate payment methods list
  const paymentMethodsList = emailTemplate && emailTemplate.paymentMethods 
    ? emailTemplate.paymentMethods.map(method => 
        `<span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #4a5565; margin-right: 8px;">${method}</span>`
      ).join('')
    : '';

  // Generate payment description
  const paymentDescription = emailTemplate && emailTemplate.paymentDescription 
    ? `<div style="margin-top: 12px;"><p style="color: #6a7282; font-size: 13px; line-height: 1.5;">${emailTemplate.paymentDescription}</p></div>`
    : '';

  // Generate footer
  const footerThankYou = emailTemplate && emailTemplate.footer 
    ? emailTemplate.footer.thankYou || 'Thank you for your business!'
    : 'Thank you for your business!';
  
  const footerTerms = emailTemplate && emailTemplate.footer 
    ? emailTemplate.footer.terms || 'Payment is due within 30 days of invoice date.'
    : 'Payment is due within 30 days of invoice date.';
  
  const footerContact = emailTemplate && emailTemplate.footer 
    ? emailTemplate.footer.contact || 'If you have any questions, please contact us.'
    : 'If you have any questions, please contact us.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.number}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #364153; background-color: #ffffff; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; }
        .header { background: #101828; padding: 32px 24px; text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: 700; color: white; margin-bottom: 4px; letter-spacing: -0.02em; }
        .invoice-title { color: #99a1af; font-size: 14px; font-weight: 500; }
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
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo">${user.businessName || 'Your Business Name'}</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="invoice-header">
          <div class="business-info">
            <div class="info-title">From:</div>
            <div class="info-item">${user.businessName || 'Your Business Name'}</div>
            <div class="info-item">${user.address || '123 Business St, City, State 12345'}</div>
            <div class="info-item">${user.phone || '(555) 123-4567'}</div>
            <div class="info-item">${user.email || 'contact@yourbusiness.com'}</div>
            <div class="info-item">${user.website || 'www.yourbusiness.com'}</div>
          </div>
          <div class="client-info">
            <div class="info-title">To:</div>
            <div class="info-item">${invoice.client || 'Client Name'}</div>
            <div class="info-item">${invoice.clientEmail || 'client@example.com'}</div>
            <div class="info-item">Client Address</div>
            <div class="info-item">Client Phone</div>
          </div>
        </div>

        <div class="invoice-details">
          <div class="invoice-number">Invoice #${invoice.number}</div>
          <div class="invoice-date">Date: ${new Date(invoice.issueDate).toLocaleDateString()} | Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</div>
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
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          ${taxRate > 0 ? `
          <div class="total-row">
            <span>Tax (${taxRate}%):</span>
            <span>$${taxAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="payment-info">
          <div class="payment-title">Payment Methods</div>
          <div class="payment-methods">
            ${paymentMethodsList}
          </div>
          ${paymentDescription}
        </div>

        <div class="footer">
          <p class="footer-text">${footerThankYou}</p>
          <p class="footer-text">${footerTerms}</p>
          <p class="footer-text">${footerContact}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate invoice PDF
const generateInvoicePDF = async (invoice, user, emailTemplate = null) => {
  try {
    const htmlContent = generateInvoiceHTML(invoice, user, emailTemplate);
    const pdfBuffer = await generatePDFFromHTML(htmlContent);
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error('Failed to generate invoice PDF');
  }
};

module.exports = {
  generatePDFFromHTML,
  generateInvoiceHTML,
  generateInvoicePDF
};
