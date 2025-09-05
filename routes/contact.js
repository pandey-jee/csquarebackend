const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { validateContact } = require('../middleware/validation');
const { authenticateAdmin } = require('../middleware/auth');
const { sendContactEmail } = require('../utils/email');

// POST /api/contact - Submit contact form
router.post('/', validateContact, async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    const contact = new Contact(contactData);
    await contact.save();
    
    // Send email notification (optional)
    try {
      await sendContactEmail(contact);
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contact.id,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to submit contact form',
      details: error.message
    });
  }
});

// GET /api/contact - Get all contact messages (Admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, type, limit, page } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Contact.countDocuments(query);
    
    res.json({
      success: true,
      count: contacts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact messages',
      details: error.message
    });
  }
});

// GET /api/contact/:id - Get single contact message (Admin only)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }
    
    // Mark as read if it's new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }
    
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact message',
      details: error.message
    });
  }
});

// PUT /api/contact/:id/status - Update contact status (Admin only)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, notes, repliedBy } = req.body;
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (status === 'replied') {
      updateData.replied = true;
      updateData.repliedAt = new Date();
      if (repliedBy) updateData.repliedBy = repliedBy;
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      data: contact,
      message: 'Contact status updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update contact status',
      details: error.message
    });
  }
});

// DELETE /api/contact/:id - Delete contact message (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact message',
      details: error.message
    });
  }
});

// GET /api/contact/stats/overview - Get contact statistics (Admin only)
router.get('/stats/overview', authenticateAdmin, async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Contact.countDocuments();
    const thisMonth = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    
    res.json({
      success: true,
      data: {
        total,
        thisMonth,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact statistics',
      details: error.message
    });
  }
});

module.exports = router;
