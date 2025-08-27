const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join('uploads', id);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

// Get files by type
const getFilesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const uploadDir = 'uploads/';
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const files = fs.readdirSync(uploadDir)
      .filter(file => file.includes(type))
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
          size: stats.size,
          uploadedAt: stats.mtime
        };
      });
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    logger.error('Error getting files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get files',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  deleteFile,
  getFilesByType
};
