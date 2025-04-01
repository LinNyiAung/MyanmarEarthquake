const express = require('express');
const multer = require('multer');
const router = express.Router();
const Marker = require('../models/markerModel');
const fs = require('fs');
const path = require('path');

// Set up multer for handling file uploads
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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Helper function to handle base64 image
const handleBase64Image = async (imageString) => {
  if (!imageString || !imageString.startsWith('data:image/')) {
    return null;
  }

  try {
    // Extract mime type and base64 data
    const matches = imageString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const type = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    
    // Create unique filename and save
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${type.split('/')[1]}`;
    const uploadDir = 'uploads/';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, data);
    
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error processing base64 image:', error);
    return null;
  }
};

// Process multiple base64 images
const handleMultipleBase64Images = async (imagesArray) => {
  if (!Array.isArray(imagesArray)) {
    return [];
  }

  const imagePaths = [];
  
  for (const imageString of imagesArray) {
    if (imageString && imageString.startsWith('data:image/')) {
      const imagePath = await handleBase64Image(imageString);
      if (imagePath) {
        imagePaths.push(imagePath);
      }
    } else if (imageString && imageString.startsWith('/uploads/')) {
      // If it's already a saved path, keep it as is
      imagePaths.push(imageString);
    }
  }
  
  return imagePaths;
};

// GET all markers
router.get('/', async (req, res) => {
  try {
    const markers = await Marker.find().sort({ createdAt: -1 });
    res.json(markers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET marker by ID
router.get('/:id', async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id);
    if (!marker) {
      return res.status(404).json({ message: 'Marker not found' });
    }
    res.json(marker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new marker
router.post('/', async (req, res) => {
  try {
    const markerData = { ...req.body };
    
    // Handle multiple base64 images if present
    if (markerData.images && Array.isArray(markerData.images)) {
      // Limit to 5 images
      if (markerData.images.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed per marker' });
      }
      
      const imagePaths = await handleMultipleBase64Images(markerData.images);
      markerData.images = imagePaths;
    }
    
    // Handle legacy imageUrl if present (for backward compatibility)
    if (markerData.imageUrl && markerData.imageUrl.startsWith('data:image/')) {
      const imagePath = await handleBase64Image(markerData.imageUrl);
      if (imagePath) {
        // Add to images array
        if (!markerData.images) markerData.images = [];
        markerData.images.push(imagePath);
        // Remove the old field
        delete markerData.imageUrl;
      }
    }
    
    const marker = new Marker(markerData);
    const savedMarker = await marker.save();
    res.status(201).json(savedMarker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a marker
router.put('/:id', async (req, res) => {
  try {
    const markerData = { ...req.body, updatedAt: Date.now() };
    
    // Handle multiple base64 images if present
    if (markerData.images && Array.isArray(markerData.images)) {
      // Limit to 5 images
      if (markerData.images.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed per marker' });
      }
      
      const imagePaths = await handleMultipleBase64Images(markerData.images);
      markerData.images = imagePaths;
    }
    
    // Handle legacy imageUrl if present (for backward compatibility)
    if (markerData.imageUrl) {
      if (markerData.imageUrl.startsWith('data:image/')) {
        const imagePath = await handleBase64Image(markerData.imageUrl);
        if (imagePath) {
          // Add to images array
          if (!markerData.images) markerData.images = [];
          markerData.images.push(imagePath);
        }
      } else if (markerData.imageUrl.startsWith('/uploads/')) {
        // It's already a valid path
        if (!markerData.images) markerData.images = [];
        markerData.images.push(markerData.imageUrl);
      }
      // Remove the old field
      delete markerData.imageUrl;
    }
    
    const updatedMarker = await Marker.findByIdAndUpdate(
      req.params.id, 
      markerData,
      { new: true }
    );
    
    if (!updatedMarker) {
      return res.status(404).json({ message: 'Marker not found' });
    }
    
    res.json(updatedMarker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a marker
router.delete('/:id', async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id);
    
    if (!marker) {
      return res.status(404).json({ message: 'Marker not found' });
    }
    
    // Delete associated images if they exist
    if (marker.images && Array.isArray(marker.images)) {
      marker.images.forEach(imagePath => {
        if (imagePath && imagePath.startsWith('/uploads/')) {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });
    }
    
    // Also check for legacy imageUrl
    if (marker.imageUrl && marker.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', marker.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Marker.findByIdAndDelete(req.params.id);
    res.json({ message: 'Marker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH update marker status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['needsHelp', 'inProgress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedMarker = await Marker.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedMarker) {
      return res.status(404).json({ message: 'Marker not found' });
    }
    
    res.json(updatedMarker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;