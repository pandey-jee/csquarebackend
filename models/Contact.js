const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 200,
    default: 'Contact from C-Square Club Website'
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['general', 'join', 'collaboration', 'event', 'technical', 'other'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  replied: {
    type: Boolean,
    default: false
  },
  repliedAt: {
    type: Date
  },
  repliedBy: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ type: 1 });
contactSchema.index({ email: 1 });

// Ensure virtual fields are serialized
contactSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.ipAddress;
    delete ret.userAgent;
    return ret;
  }
});

module.exports = mongoose.model('Contact', contactSchema);
