const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { authenticateAdmin } = require('../middleware/auth');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Hash the admin password on server startup
const createHashedPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Simple in-memory admin user (in production, use database)
const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'admin',
  passwordHash: null // Will be set on startup
};

// Initialize hashed password
const initializeAdmin = async () => {
  const plainPassword = process.env.ADMIN_PASSWORD || 'csquare2024';
  ADMIN_USER.passwordHash = await createHashedPassword(plainPassword);
};

// Initialize admin on module load
initializeAdmin();

// POST /api/auth/login - Admin login with rate limiting
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    // Check username
    if (username !== ADMIN_USER.username) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, ADMIN_USER.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { username: ADMIN_USER.username, role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          username: ADMIN_USER.username,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: error.message
    });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    valid: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = router;
