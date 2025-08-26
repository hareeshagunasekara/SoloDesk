const Invoice = require("../models/Invoice");
const { validationResult } = require("express-validator");

// List all invoices for the current user
exports.getInvoices = async (req, res) => {
  try {
    const query = { createdBy: req.user._id };
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.$or = [
        { number: { $regex: req.query.search, $options: "i" } },
        { client: { $regex: req.query.search, $options: "i" } },
        { clientEmail: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.startDate && req.query.endDate) {
      query.dueDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }
    let sort = { issueDate: -1 };
    if (req.query.sortBy === "oldest") sort = { issueDate: 1 };
    if (req.query.sortBy === "highest") sort = { amount: -1 };
    if (req.query.sortBy === "lowest") sort = { amount: 1 };
    
    const invoices = await Invoice.find(query)
      .populate('projectId', 'name status dueDate')
      .sort(sort);
    
    // Transform the data to match the frontend expectations
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice._id,
      number: invoice.number,
      client: invoice.client,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.dueDate,
      issueDate: invoice.issueDate,
      paidDate: invoice.paidDate,
      project: invoice.projectId ? invoice.projectId.name : null,
      projectId: invoice.projectId ? invoice.projectId._id : null,
      items: invoice.items,
      notes: invoice.notes,
      terms: invoice.terms,
      tax: invoice.tax,
      discount: invoice.discount,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    }));
    
    res.json(transformedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res
      .status(500)
      .json({ message: "Failed to fetch invoices", error: error.message });
  }
};

// Get a single invoice
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate('projectId', 'name status dueDate');
    
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    
    // Transform the data to match the frontend expectations
    const transformedInvoice = {
      id: invoice._id,
      number: invoice.number,
      client: invoice.client,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.dueDate,
      issueDate: invoice.issueDate,
      paidDate: invoice.paidDate,
      project: invoice.projectId ? invoice.projectId.name : null,
      projectId: invoice.projectId ? invoice.projectId._id : null,
      items: invoice.items,
      notes: invoice.notes,
      terms: invoice.terms,
      tax: invoice.tax,
      discount: invoice.discount,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    };
    
    res.json(transformedInvoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res
      .status(500)
      .json({ message: "Failed to fetch invoice", error: error.message });
  }
};

// Create a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Prepare invoice data
    const invoiceData = {
      ...req.body,
      createdBy: req.user._id,
      // Ensure dates are properly formatted
      dueDate: new Date(req.body.dueDate),
      issueDate: new Date(req.body.issueDate),
      // Ensure numeric fields are numbers
      amount: Number(req.body.amount),
      tax: Number(req.body.tax || 0),
      discount: Number(req.body.discount || 0),
      total: Number(req.body.total),
      // Set default currency if not provided
      currency: req.body.currency || 'USD',
      // Ensure items have proper structure
      items: req.body.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        taskId: item.taskId || null,
        isCustom: item.isCustom || false,
      }))
    };
    
    console.log('Creating invoice with data:', invoiceData);
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    console.log('Invoice created successfully:', invoice._id);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    
    // Handle duplicate invoice number error
    if (error.code === 11000 && error.keyPattern?.number) {
      return res.status(400).json({ 
        message: "Invoice number already exists. Please use a different number." 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to create invoice", 
      error: error.message 
    });
  }
};

// Update an invoice
exports.updateInvoice = async (req, res) => {
  try {
    // Get the current invoice to check if status is being changed to paid
    const currentInvoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!currentInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const isStatusChangedToPaid = currentInvoice.status !== 'paid' && req.body.status === 'paid';

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true },
    ).populate('projectId', 'name status dueDate');

    // If status was changed to paid, send automatic emails
    if (isStatusChangedToPaid) {
      // Get user details for email
      const User = require("../models/User");
      const user = await User.findById(req.user._id).select('firstName lastName email phone businessName website address logo');
      
      // Get client details for follow-up email
      const Client = require("../models/Client");
      const client = await Client.findOne({ 
        email: invoice.clientEmail, 
        createdBy: req.user._id 
      });

      // Import email services
      const { sendInvoiceEmail } = require("../services/emailService");
      const { generateFollowUpEmailTemplate, generatePaymentConfirmationTemplate } = require("../services/emailTemplateService");
      const EmailTemplate = require("../models/EmailTemplate");

      try {
        // Send Follow-up Email
        const followUpTemplate = await EmailTemplate.findOne({ 
          type: 'follow_up', 
          userId: req.user._id,
          isActive: true 
        });

        if (followUpTemplate && client) {
          const followUpEmailData = generateFollowUpEmailTemplate(
            followUpTemplate, 
            user, 
            { name: client.name || invoice.client }
          );

          await sendInvoiceEmail(
            invoice.clientEmail,
            followUpEmailData.subject,
            followUpEmailData.html,
            user,
            invoice,
            followUpTemplate
          );
          console.log(`Follow-up email sent for invoice ${invoice.number}`);
        }

        // Send Payment Confirmation Email
        const paymentConfirmationTemplate = await EmailTemplate.findOne({ 
          type: 'payment_confirmation', 
          userId: req.user._id,
          isActive: true 
        });

        if (paymentConfirmationTemplate) {
          const paymentConfirmationData = generatePaymentConfirmationTemplate(
            paymentConfirmationTemplate, 
            user, 
            invoice
          );

          await sendInvoiceEmail(
            invoice.clientEmail,
            paymentConfirmationData.subject,
            paymentConfirmationData.html,
            user,
            invoice,
            paymentConfirmationTemplate
          );
          console.log(`Payment confirmation email sent for invoice ${invoice.number}`);
        }

      } catch (emailError) {
        console.error('Error sending automatic emails:', emailError);
        // Don't fail the entire operation if emails fail
        // The invoice is still updated
      }
    }

    res.json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update invoice", error: error.message });
  }
};

// Delete an invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete invoice", error: error.message });
  }
};

// Mark as paid
exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status: "paid", paidDate: new Date() },
      { new: true },
    ).populate('projectId', 'name status dueDate');
    
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Get user details for email
    const User = require("../models/User");
    const user = await User.findById(req.user._id).select('firstName lastName email phone businessName website address logo');
    
    // Get client details for follow-up email
    const Client = require("../models/Client");
    const client = await Client.findOne({ 
      email: invoice.clientEmail, 
      createdBy: req.user._id 
    });

    // Import email services
    const { sendInvoiceEmail } = require("../services/emailService");
    const { generateFollowUpEmailTemplate, generatePaymentConfirmationTemplate } = require("../services/emailTemplateService");
    const EmailTemplate = require("../models/EmailTemplate");

    try {
      // Send Follow-up Email
      const followUpTemplate = await EmailTemplate.findOne({ 
        type: 'follow_up', 
        userId: req.user._id,
        isActive: true 
      });

      if (followUpTemplate && client) {
        const followUpEmailData = generateFollowUpEmailTemplate(
          followUpTemplate, 
          user, 
          { name: client.name || invoice.client }
        );

        await sendInvoiceEmail(
          invoice.clientEmail,
          followUpEmailData.subject,
          followUpEmailData.html,
          user,
          invoice,
          followUpTemplate
        );
        console.log(`Follow-up email sent for invoice ${invoice.number}`);
      }

      // Send Payment Confirmation Email
      const paymentConfirmationTemplate = await EmailTemplate.findOne({ 
        type: 'payment_confirmation', 
        userId: req.user._id,
        isActive: true 
      });

      if (paymentConfirmationTemplate) {
        const paymentConfirmationData = generatePaymentConfirmationTemplate(
          paymentConfirmationTemplate, 
          user, 
          invoice
        );

        await sendInvoiceEmail(
          invoice.clientEmail,
          paymentConfirmationData.subject,
          paymentConfirmationData.html,
          user,
          invoice,
          paymentConfirmationTemplate
        );
        console.log(`Payment confirmation email sent for invoice ${invoice.number}`);
      }

    } catch (emailError) {
      console.error('Error sending automatic emails:', emailError);
      // Don't fail the entire operation if emails fail
      // The invoice is still marked as paid
    }

    res.json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to mark as paid", error: error.message });
  }
};

// Send or resend invoice
exports.sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate('projectId', 'name status dueDate');
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Get user details for email
    const User = require("../models/User");
    const user = await User.findById(req.user._id).select('firstName lastName email phone businessName website address');
    
    // Get email template based on invoice status
    const EmailTemplate = require("../models/EmailTemplate");
    let emailTemplate = null;
    
    if (invoice.status === 'draft') {
      // For draft invoices, use the main invoice template
      emailTemplate = await EmailTemplate.findOne({ 
        type: 'invoice', 
        userId: req.user._id,
        isActive: true 
      });
    } else if (invoice.status === 'pending') {
      // For pending invoices, try to find a reminder template, fallback to main template
      emailTemplate = await EmailTemplate.findOne({ 
        type: 'invoice_reminder', 
        userId: req.user._id,
        isActive: true 
      }) || await EmailTemplate.findOne({ 
        type: 'invoice', 
        userId: req.user._id,
        isActive: true 
      });
    } else if (invoice.status === 'overdue') {
      // For overdue invoices, try to find a reminder template, fallback to main template
      emailTemplate = await EmailTemplate.findOne({ 
        type: 'invoice_reminder', 
        userId: req.user._id,
        isActive: true 
      }) || await EmailTemplate.findOne({ 
        type: 'invoice', 
        userId: req.user._id,
        isActive: true 
      });
    }

    // Generate email subject and content based on status
    let emailSubject = '';
    let emailHtml = '';
    
    if (emailTemplate) {
      // Use the emailTemplateService for better template generation
      const emailTemplateService = require("../services/emailTemplateService");
      
      // Prepare template data from the saved template
      const templateData = {
        subject: emailTemplate.subject,
        header: emailTemplate.header || { title: 'INVOICE', subtitle: 'Professional Services' },
        businessDetails: emailTemplate.businessDetails || {},
        clientDetails: emailTemplate.clientDetails || {},
        invoiceDetails: emailTemplate.invoiceDetails || {},
        items: emailTemplate.items || [],
        paymentMethods: emailTemplate.paymentMethods || ['Bank Transfer', 'Credit Card', 'PayPal', 'Check'],
        paymentDescription: emailTemplate.paymentDescription || '',
        footer: emailTemplate.footer || {
          thankYou: 'Thank you for your business!',
          terms: 'Payment is due within 30 days of invoice date.',
          contact: 'If you have any questions, please contact us.'
        }
      };

      // Generate the base template
      const generatedTemplate = emailTemplateService.generateInvoiceEmailTemplate(templateData, user, invoice);
      
      // Start with the generated HTML
      emailHtml = generatedTemplate.html;
      emailSubject = generatedTemplate.subject;
      
      // Replace all template variables with actual values
      emailHtml = emailHtml
        .replace(/{businessName}/g, user.businessName || 'Your Business')
        .replace(/{businessAddress}/g, user.address ? 
          `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}, ${user.address.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
        : 'Business Address')
        .replace(/{businessPhone}/g, user.phone || 'Business Phone')
        .replace(/{businessEmail}/g, user.email || 'business@email.com')
        .replace(/{businessWebsite}/g, user.website || 'www.business.com')
        .replace(/{businessLogo}/g, user.logo || '')
        .replace(/{clientName}/g, invoice.client || 'Client Name')
        .replace(/{clientEmail}/g, invoice.clientEmail || 'client@email.com')
        .replace(/{clientAddress}/g, 'Client Address')
        .replace(/{clientPhone}/g, 'Client Phone')
        .replace(/{invoiceNumber}/g, invoice.number)
        .replace(/{invoiceDate}/g, invoice.issueDate.toLocaleDateString())
        .replace(/{dueDate}/g, invoice.dueDate.toLocaleDateString())
        .replace(/{subtotal}/g, `$${invoice.amount.toFixed(2)}`)
        .replace(/{taxRate}/g, invoice.tax ? `${invoice.tax}%` : '0%')
        .replace(/{taxAmount}/g, invoice.tax ? `$${((invoice.amount * invoice.tax) / 100).toFixed(2)}` : '$0.00')
        .replace(/{total}/g, `$${invoice.total.toFixed(2)}`);
      
      // Replace items list with actual invoice items
      if (invoice.items && invoice.items.length > 0) {
        const itemsList = invoice.items.map(item => `
          <tr>
            <td class="description">${item.description}</td>
            <td>${item.quantity}</td>
            <td>$${item.rate.toFixed(2)}</td>
            <td class="amount">$${item.amount.toFixed(2)}</td>
          </tr>
        `).join('');
        emailHtml = emailHtml.replace('{itemsList}', itemsList);
      } else {
        // Use template items if no invoice items
        const templateItemsList = emailTemplate.items ? emailTemplate.items.map(item => `
          <tr>
            <td class="description">${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.unitPrice}</td>
            <td class="amount">${item.amount}</td>
          </tr>
        `).join('') : '';
        emailHtml = emailHtml.replace('{itemsList}', templateItemsList);
      }
      
      // Replace payment methods
      if (emailTemplate.paymentMethods && emailTemplate.paymentMethods.length > 0) {
        const paymentMethodsList = emailTemplate.paymentMethods.map(method => 
          `<span class="payment-method">${method}</span>`
        ).join('');
        emailHtml = emailHtml.replace('{paymentMethodsList}', paymentMethodsList);
      }
      
      // Replace payment description
      if (emailTemplate.paymentDescription) {
        emailHtml = emailHtml.replace('{paymentDescription}', emailTemplate.paymentDescription);
      } else {
        emailHtml = emailHtml.replace('{paymentDescription}', '');
      }
      
      // Replace footer
      if (emailTemplate.footer) {
        emailHtml = emailHtml.replace('{thankYou}', emailTemplate.footer.thankYou || 'Thank you for your business!');
        emailHtml = emailHtml.replace('{terms}', emailTemplate.footer.terms || 'Payment is due within 30 days.');
        emailHtml = emailHtml.replace('{contact}', emailTemplate.footer.contact || 'If you have any questions, please contact us.');
      }
      
      // Add status-specific subject modifications
      if (invoice.status === 'pending') {
        emailSubject = emailSubject.replace('Invoice', 'Payment Reminder - Invoice');
      } else if (invoice.status === 'overdue') {
        emailSubject = emailSubject.replace('Invoice', 'Overdue Payment Reminder - Invoice');
      }
      
      // Add status-specific content for reminders
      if (invoice.status === 'pending' || invoice.status === 'overdue') {
        const reminderMessage = invoice.status === 'overdue' 
          ? `<div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; color: #dc2626;">
              <strong>Payment Overdue:</strong> This invoice is past its due date. Please process payment as soon as possible.
            </div>`
          : `<div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0; color: #d97706;">
              <strong>Payment Reminder:</strong> This is a friendly reminder that payment is due on ${invoice.dueDate.toLocaleDateString()}.
            </div>`;
        
        // Insert reminder message after the opening paragraph
        const contentStart = emailHtml.indexOf('<div class="content">');
        if (contentStart !== -1) {
          const contentEnd = emailHtml.indexOf('</div>', contentStart);
          if (contentEnd !== -1) {
            emailHtml = emailHtml.substring(0, contentEnd) + reminderMessage + emailHtml.substring(contentEnd);
          }
        }
      }
      
    } else {
      // Fallback to default template with invoice details displayed
      emailSubject = `Invoice ${invoice.number} - ${user.businessName || 'Your Business'}`;
      
      // Add status-specific subject modifications
      if (invoice.status === 'pending') {
        emailSubject = `Payment Reminder - ${emailSubject}`;
      } else if (invoice.status === 'overdue') {
        emailSubject = `Overdue Payment Reminder - ${emailSubject}`;
      }
      
      // Generate items table
      const itemsTable = invoice.items && invoice.items.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Description</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Rate</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${item.description}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">$${item.rate.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '';
      
      // Add status-specific content for reminders
      const reminderContent = invoice.status === 'overdue' 
        ? `<div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; color: #dc2626;">
            <strong>Payment Overdue:</strong> This invoice is past its due date. Please process payment as soon as possible.
          </div>`
        : invoice.status === 'pending'
        ? `<div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0; color: #d97706;">
            <strong>Payment Reminder:</strong> This is a friendly reminder that payment is due on ${invoice.dueDate.toLocaleDateString()}.
          </div>`
        : '';
      
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e2939 0%, #364153 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
            .content { padding: 30px; }
            .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .invoice-details table { width: 100%; }
            .invoice-details td { padding: 8px 0; }
            .invoice-details td:first-child { font-weight: bold; width: 40%; }
            .total-section { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice ${invoice.number}</h1>
              <p>${user.businessName || 'Your Business'}</p>
            </div>
            <div class="content">
              <p>Dear ${invoice.client || 'Client'},</p>
              <p>Please find your invoice for ${invoice.projectId ? invoice.projectId.name : 'services provided'}.</p>
              
              ${reminderContent}
              
              <div class="invoice-details">
                <table>
                  <tr><td>Invoice Number:</td><td>${invoice.number}</td></tr>
                  <tr><td>Issue Date:</td><td>${invoice.issueDate.toLocaleDateString()}</td></tr>
                  <tr><td>Due Date:</td><td>${invoice.dueDate.toLocaleDateString()}</td></tr>
                  <tr><td>Client:</td><td>${invoice.client}</td></tr>
                  <tr><td>Project:</td><td>${invoice.projectId ? invoice.projectId.name : 'N/A'}</td></tr>
                </table>
              </div>
              
              ${itemsTable}
              
              <div class="total-section">
                <p><strong>Subtotal:</strong> $${invoice.amount.toFixed(2)}</p>
                ${invoice.tax ? `<p><strong>Tax (${invoice.tax}%):</strong> $${((invoice.amount * invoice.tax) / 100).toFixed(2)}</p>` : ''}
                <p><strong>Total Amount:</strong> $${invoice.total.toFixed(2)}</p>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>If you have any questions, please contact us at ${user.email || 'business@email.com'}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email
    const emailService = require("../services/emailService");
    console.log('Attempting to send invoice email to:', invoice.clientEmail);
    console.log('Email subject:', emailSubject);
    console.log('Invoice status:', invoice.status);
    
    const emailResult = await emailService.sendInvoiceEmail(
      invoice.clientEmail,
      emailSubject,
      emailHtml,
      user,
      invoice,
      emailTemplate
    );
    
    console.log('Email sent successfully:', emailResult);

    // Update invoice status and sent date based on current status
    let updatedStatus = invoice.status;
    if (invoice.status === 'draft') {
      updatedStatus = 'pending';
    }
    
    // Update the invoice with new status and sent date
    await Invoice.findByIdAndUpdate(invoice._id, { 
      status: updatedStatus,
      sentDate: new Date()
    });

    res.json({ 
      success: true,
      message: invoice.status === 'draft' ? "Invoice sent successfully" : "Reminder sent successfully",
      status: updatedStatus
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send invoice", 
      error: error.message 
    });
  }
};

// Download PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
    }).populate('projectId', 'name status dueDate');
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Get user details for PDF
    const User = require("../models/User");
    const user = await User.findById(invoice.createdBy).select('firstName lastName email phone businessName website address');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get email template for styling consistency
    const EmailTemplate = require("../models/EmailTemplate");
    const emailTemplate = await EmailTemplate.findOne({ 
      type: 'invoice', 
      createdBy: invoice.createdBy,
      isActive: true 
    });

    try {
      // Try to generate PDF
      const { generateInvoicePDF } = require('../utils/pdfGenerator');
      const pdfBuffer = await generateInvoicePDF(invoice, user, emailTemplate);

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.number}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send the PDF buffer
      res.send(pdfBuffer);
    } catch (pdfError) {
      console.error('PDF generation failed, falling back to HTML:', pdfError);
      
      // Fallback to HTML response
      const { generateInvoiceHTML } = require('../utils/pdfGenerator');
      const htmlContent = generateInvoiceHTML(invoice, user, emailTemplate);
      
      // Set response headers for HTML download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.number}.html"`);
      
      // Send the HTML content
      res.send(htmlContent);
    }
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to download invoice", 
      error: error.message 
    });
  }
};

// Get next invoice number
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Find the highest invoice number for the current year
    const lastInvoice = await Invoice.findOne({
      number: { $regex: `^INV-${currentYear}-` },
      createdBy: req.user._id
    }).sort({ number: -1 });
    
    let nextNumber;
    
    if (lastInvoice) {
      // Extract the number part and increment it
      const match = lastInvoice.number.match(/^INV-\d{4}-(\d+)$/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = `INV-${currentYear}-${String(lastNumber + 1).padStart(4, '0')}`;
      } else {
        // Fallback if format doesn't match
        nextNumber = `INV-${currentYear}-0001`;
      }
    } else {
      // No invoices for this year, start with 0001
      nextNumber = `INV-${currentYear}-0001`;
    }
    
    res.json({
      success: true,
      data: { nextNumber }
    });
  } catch (error) {
    console.error('Error generating next invoice number:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice number",
      error: error.message
    });
  }
};
