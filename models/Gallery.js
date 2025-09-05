const mongoose = require('mongoose');
const { isValidImageUrl } = require('../utils/urlValidation');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return isValidImageUrl(v);
      },
      message: 'imageUrl must be a valid image URL (supports HTTP/HTTPS URLs, data URLs, and CDN links)'
    }
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
