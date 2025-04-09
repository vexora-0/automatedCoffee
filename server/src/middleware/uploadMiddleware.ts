import multer from 'multer';

// Configure multer for memory storage (we'll process and send to Cloudinary)
const storage = multer.memoryStorage();

// File size limits and type validation
const fileFilter = (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
  } else {
    callback(new Error('Only image files are allowed'));
  }
};

// Create multer instance with configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter,
});

export default upload; 