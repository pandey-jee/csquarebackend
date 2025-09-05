const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { validateEvent } = require('../middleware/validation');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const { type, featured, limit } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (featured) query.featured = featured === 'true';
    
    let eventsQuery = Event.find(query).sort({ createdAt: -1 });
    
    if (limit) eventsQuery = eventsQuery.limit(parseInt(limit));
    
    const events = await eventsQuery;
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      details: error.message
    });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      details: error.message
    });
  }
});

// POST /api/events - Create new event (Admin only)
router.post('/', authenticateAdmin, validateEvent, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create event',
      details: error.message
    });
  }
});

// PUT /api/events/:id - Update event (Admin only)
router.put('/:id', authenticateAdmin, validateEvent, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update event',
      details: error.message
    });
  }
});

// DELETE /api/events/:id - Delete event (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      details: error.message
    });
  }
});

// GET /api/events/upcoming/featured - Get featured upcoming events
router.get('/upcoming/featured', async (req, res) => {
  try {
    const events = await Event.find({
      type: 'upcoming',
      featured: true
    }).sort({ createdAt: -1 }).limit(3);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured events',
      details: error.message
    });
  }
});

module.exports = router;
