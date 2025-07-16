const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/projectController');

// All routes are protected
router.use(auth);

// Project routes
router.post('/', createProject);
router.get('/', getProjects);
router.get('/stats', getProjectStats);
router.get('/:projectId', getProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

module.exports = router; 