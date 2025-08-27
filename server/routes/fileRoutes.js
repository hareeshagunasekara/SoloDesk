const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const { upload, uploadFile, deleteFile, getFilesByType } = require('../controllers/fileController');

// All routes require authentication
router.use(auth);

// Upload file
router.post('/upload', upload.single('file'), uploadFile);

// Delete file
router.delete('/:id', deleteFile);

// Get files by type
router.get('/:type', getFilesByType);

module.exports = router;
