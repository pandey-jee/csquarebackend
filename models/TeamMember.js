const mongoose = require('mongoose');
const { isValidImageUrl, isValidUrl } = require('../utils/urlValidation');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  position: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  initials: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 3,
    minlength: 1
  },
  photo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return isValidImageUrl(v);
      },
      message: 'Photo must be a valid image URL (supports HTTP/HTTPS URLs, data URLs, and CDN links)'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  linkedin: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return isValidUrl(v);
      },
      message: 'LinkedIn must be a valid URL'
    }
  },
  github: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return isValidUrl(v);
      },
      message: 'GitHub must be a valid URL'
    }
  },
  portfolio: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return isValidUrl(v);
      },
      message: 'Portfolio must be a valid URL'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCore: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
teamMemberSchema.index({ isActive: 1, displayOrder: 1 });
teamMemberSchema.index({ isCore: 1 });
teamMemberSchema.index({ position: 1 });

// Virtual for full name initials generation
teamMemberSchema.virtual('autoInitials').get(function() {
  return this.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
});

// Pre-save middleware to auto-generate initials if not provided
teamMemberSchema.pre('save', function(next) {
  if (!this.initials) {
    this.initials = this.autoInitials;
  }
  next();
});

// Ensure virtual fields are serialized
teamMemberSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);
