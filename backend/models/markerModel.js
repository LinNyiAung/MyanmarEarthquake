const mongoose = require('mongoose');

const markerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['damage', 'shelter', 'medical', 'supplies', 'rescue', 'other']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['needsHelp', 'inProgress', 'resolved'],
    default: 'needsHelp'
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geospatial queries
markerSchema.index({ lat: 1, lng: 1 });

const Marker = mongoose.model('Marker', markerSchema);

module.exports = Marker;