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
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true },
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
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
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to mark as paid", error: error.message });
  }
};

// Send or resend invoice (stub)
exports.sendInvoice = async (req, res) => {
  // Here you would trigger an email with the invoice PDF
  res.json({ message: "Invoice sent (stub)" });
};

// Download PDF (stub)
exports.downloadInvoice = async (req, res) => {
  // Here you would generate and send a PDF file
  res.json({ message: "Download PDF (stub)" });
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
