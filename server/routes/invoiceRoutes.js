const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { auth } = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(auth);

// Validation rules for creating/updating invoices
const invoiceValidation = [
  body("number").notEmpty().withMessage("Invoice number is required"),
  body("client").notEmpty().withMessage("Client name is required"),
  body("clientEmail").isEmail().withMessage("Valid client email is required"),
  body("amount").isNumeric().withMessage("Amount must be a number"),
  body("total").isNumeric().withMessage("Total must be a number"),
  body("dueDate").notEmpty().withMessage("Due date is required"),
  body("issueDate").notEmpty().withMessage("Issue date is required"),
  body("currency").optional().isString().withMessage("Currency must be a string"),
  body("discount").optional().isNumeric().withMessage("Discount must be a number"),
  body("tax").optional().isNumeric().withMessage("Tax must be a number"),
  body("projectId")
    .optional()
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value is provided, it must be a valid MongoDB ObjectId
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(value)) {
        throw new Error('Project ID must be a valid MongoDB ID');
      }
      return true;
    })
    .withMessage("Project ID must be a valid MongoDB ID"),
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.description").notEmpty().withMessage("Item description is required"),
  body("items.*.quantity").isNumeric().withMessage("Item quantity must be a number"),
  body("items.*.rate").isNumeric().withMessage("Item rate must be a number"),
  body("items.*.amount").isNumeric().withMessage("Item amount must be a number"),
];

// RESTful routes
router.get("/", invoiceController.getInvoices);
router.get("/next-number", invoiceController.getNextInvoiceNumber);
router.get("/:id", invoiceController.getInvoiceById);
router.post("/", invoiceValidation, invoiceController.createInvoice);
router.put("/:id", invoiceValidation, invoiceController.updateInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

// Actions
router.post("/:id/send", invoiceController.sendInvoice);
router.put("/:id/paid", invoiceController.markAsPaid);
router.get("/:id/download", invoiceController.downloadInvoice);

module.exports = router;
