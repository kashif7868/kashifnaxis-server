const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/'); // Destination for uploaded files
  },

  filename: (req, file, cb) => {
    // Save file with original extension
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Image file filter for validation (accepts image and video formats)
const imageFilter = (req, file, cb) => {
  // Validate file extensions (only image and video formats allowed)
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|mp4)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true); // Accept the file
};

// Define the multer upload middleware (supports multiple file uploads)
const fileUpload = multer({ 
  storage,
  fileFilter: imageFilter, // Add file filter for validation
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: Limit the file size to 10MB (adjust as needed)
});

module.exports = {
  fileUpload,
};
