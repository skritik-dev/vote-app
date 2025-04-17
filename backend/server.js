const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const electionRoutes = require('./routes/electionRoutes');
const voteRoutes = require('./routes/voteRoutes');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `candidate-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes with multer middleware
app.use('/api/users', userRoutes);
app.use('/api/elections', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    upload.any()(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
          message: 'File upload error', 
          error: err.message 
        });
      } else if (err) {
        return res.status(400).json({ 
          message: 'Error processing upload', 
          error: err.message 
        });
      }
      console.log('Files uploaded:', req.files); // Debug log
      next();
    });
  } else {
    next();
  }
});
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 