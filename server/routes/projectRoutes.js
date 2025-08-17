const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/authMiddleware");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
  addNoteToProject,
  deleteNoteFromProject,
} = require("../controllers/projectController");

// All routes are protected
router.use(auth);

// Project routes
router.post("/", createProject);
router.get("/", getProjects);
router.get("/stats", getProjectStats);
router.get("/:projectId", getProject);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

// Add note to project
router.post("/:projectId/notes", addNoteToProject);

// Delete note from project
router.delete("/:projectId/notes/:noteId", deleteNoteFromProject);

module.exports = router;
