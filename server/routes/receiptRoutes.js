const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { auth } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(auth);

// Create a new receipt
router.post('/', receiptController.createReceipt);

// Get receipt by ID
router.get('/:id', receiptController.getReceipt);

// Get receipt by receipt number
router.get('/number/:receiptNumber', receiptController.getReceiptByNumber);

// Get all receipts for the authenticated user
router.get('/', receiptController.getUserReceipts);

// Get receipts for a specific invoice
router.get('/invoice/:invoiceId', receiptController.getReceiptsByInvoice);

// Get receipts for a specific client
router.get('/client/:clientId', receiptController.getClientReceipts);

// Update receipt
router.put('/:id', receiptController.updateReceipt);

// Delete receipt
router.delete('/:id', receiptController.deleteReceipt);

// Generate receipt PDF
router.get('/:id/pdf', receiptController.generateReceiptPDF);

// Send receipt email
router.post('/:receiptId/send', receiptController.sendReceiptEmail);

// Get receipt statistics
router.get('/stats/summary', receiptController.getReceiptStats);

module.exports = router;
