import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { __dirname } from './dirnameHelper';
import { createHotel, getHotel, updateHotel, uploadImages } from './controllers/hotelController';

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/images'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      cb(null, false);
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

// Hotel routes
app.post('/api/hotel', createHotel);
app.get('/api/hotel/:hotelID', getHotel);
app.get('/api/hotel/slug/:slug', getHotel);
app.put('/api/hotel/:hotelID', updateHotel);
app.post('/api/hotel/:hotelID/images', upload.array('images', 10), uploadImages);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  } else if (err) {
    // An unknown error occurred
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
});

const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

export { app, server };