const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { authenticateAdmin } = require('../middleware/auth');
const Joi = require('joi');

// Validation schema for gallery items
const gallerySchema = Joi.object({
  title: Joi.string().required().min(1).max(200).trim(),
  description: Joi.string().max(500).optional().trim().allow(''),
  imageUrl: Joi.string().required().min(1).trim(), // More flexible URL validation
  eventId: Joi.alternatives().try(
    Joi.string().hex().length(24), // Valid MongoDB ObjectId
    Joi.string().allow('', null),  // Allow empty string or null
    Joi.allow(null)                // Explicitly allow null
  ).optional(),
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().min(0).optional()
});

const validateGallery = (req, res, next) => {
  const { error } = gallerySchema.validate(req.body);
  
  if (error) {
    console.log('Gallery validation error:', error.details); // Debug log
    console.log('Request body:', req.body); // Debug log
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

// GET /api/gallery - Get all gallery items
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active) query.isActive = active === 'true';
    
    const galleryItems = await Gallery.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('eventId', 'title date');
    
    res.json({
      success: true,
      count: galleryItems.length,
      data: galleryItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gallery items',
      details: error.message
    });
  }
});

// POST /api/gallery - Create new gallery item (Admin only)
router.post('/', authenticateAdmin, validateGallery, async (req, res) => {
  try {
    // Process the data before saving
    const galleryData = { ...req.body };
    
    // Convert empty eventId to null for proper MongoDB handling
    if (!galleryData.eventId || galleryData.eventId.trim() === '') {
      galleryData.eventId = null;
    }
    
    const galleryItem = new Gallery(galleryData);
    await galleryItem.save();
    
    res.status(201).json({
      success: true,
      data: galleryItem,
      message: 'Gallery item created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create gallery item',
      details: error.message
    });
  }
});

// PUT /api/gallery/:id - Update gallery item (Admin only)
router.put('/:id', authenticateAdmin, validateGallery, async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        error: 'Gallery item not found'
      });
    }
    
    res.json({
      success: true,
      data: galleryItem,
      message: 'Gallery item updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update gallery item',
      details: error.message
    });
  }
});

// DELETE /api/gallery/:id - Delete gallery item (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        error: 'Gallery item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete gallery item',
      details: error.message
    });
  }
});

module.exports = router;
