const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { auth: authMiddleware } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all clients with search and filtering
router.get("/", clientController.getClients);

// Get client statistics
router.get("/stats", clientController.getClientStats);

// Get single client
router.get("/:id", clientController.getClient);

// Create new client
router.post("/", clientController.createClient);

// Update client
router.put("/:id", clientController.updateClient);

// Delete client
router.delete("/:id", clientController.deleteClient);

// Add note to client
router.post("/:id/notes", clientController.addNote);

// Update last contacted
router.patch("/:id/last-contacted", clientController.updateLastContacted);

// Attachment management
router.post("/:id/attachments", clientController.addAttachment);
router.delete(
  "/:id/attachments/:attachmentId",
  clientController.removeAttachment,
);

// Link management
router.post("/:id/links", clientController.addLink);
router.delete("/:id/links/:linkId", clientController.removeLink);

// Duplicate client
router.post("/:id/duplicate", clientController.duplicateClient);

// Get projects for a specific client
router.get("/:id/projects", clientController.getClientProjects);

// Get invoices for a specific client
router.get("/:id/invoices", clientController.getClientInvoices);

// Export client as PDF
router.get("/:id/export/pdf", clientController.exportClientPDF);

module.exports = router;
