const express = require("express");
const router = express.Router();

const emailTemplateController = require("../controllers/emailTemplateController");
const { auth } = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(auth);

// Email template routes
router.get("/", emailTemplateController.getEmailTemplates);
router.get("/default/:type", emailTemplateController.getDefaultEmailTemplate);
router.get("/:id", emailTemplateController.getEmailTemplate);
router.post("/", emailTemplateController.createEmailTemplate);
router.put("/:id", emailTemplateController.updateEmailTemplate);
router.delete("/:id", emailTemplateController.deleteEmailTemplate);

module.exports = router;
