const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/team');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const imageProxyRoutes = require('./routes/imageProxy');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow all origins for image proxy functionality
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

console.log('🔧 CORS: Allowing all origins for image proxy functionality');
app.use(cors(corsOptions));
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/c-square-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api', imageProxyRoutes); // Image proxy routes

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 C-Square Club API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Handle root path requests
app.get('/', (req, res) => {
  res.json({
    message: '🚀 C-Square Club Backend API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      events: '/api/events',
      team: '/api/team',
      contact: '/api/contact',
      auth: '/api/auth',
      gallery: '/api/gallery',
      imageProxy: '/api/proxy-image?url=https://example.com/image.jpg',
      imageProxyHealth: '/api/proxy-image/health'
    },
    features: {
      imageProxy: 'Fetch images from any external URL (LinkedIn, Twitter, Instagram, Facebook, etc.)',
      cors: 'All origins allowed for maximum compatibility'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found on this server.'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }
  
  // Mongoose cast error
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate value',
      message: `${field} already exists`
    });
  }
  
  // Default error
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
