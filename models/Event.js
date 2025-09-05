const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['upcoming', 'past'],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Link must be a valid URL'
    }
  },
  linkText: {
    type: String,
    trim: true,
    maxlength: 50,
    default: 'Learn More'
  },
  featured: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    trim: true
  },
  attendees: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  organizer: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
eventSchema.index({ type: 1, createdAt: -1 });
eventSchema.index({ featured: 1 });

// Virtual for URL-friendly slug
eventSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Event', eventSchema);
