const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateAdmin } = require('../middleware/auth');

// Simple in-memory admin user (in production, use database)
const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'csquare2024'
};

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    // Simple authentication (in production, use proper password hashing)
    if (username !== ADMIN_USER.username || password !== ADMIN_USER.password) {
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
