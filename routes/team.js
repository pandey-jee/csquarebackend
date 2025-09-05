const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const { validateTeamMember } = require('../middleware/validation');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/team - Get all team members
router.get('/', async (req, res) => {
  try {
    const { active, core, position } = req.query;
    
    let query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (core !== undefined) query.isCore = core === 'true';
    if (position) query.position = new RegExp(position, 'i');
    
    const teamMembers = await TeamMember.find(query)
      .sort({ displayOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team members',
      details: error.message
    });
  }
});

// GET /api/team/core/members - Get core team members
router.get('/core/members', async (req, res) => {
  try {
    const coreMembers = await TeamMember.find({
      isCore: true,
      isActive: true
    }).sort({ displayOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      count: coreMembers.length,
      data: coreMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch core team members',
      details: error.message
    });
  }
});

// GET /api/team/:id - Get single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    res.json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team member',
      details: error.message
    });
  }
});

// POST /api/team - Add new team member (Admin only)
router.post('/', authenticateAdmin, validateTeamMember, async (req, res) => {
  try {
    console.log('📝 Creating team member with data:', req.body);
    const teamMember = new TeamMember(req.body);
    await teamMember.save();
    
    res.status(201).json({
      success: true,
      data: teamMember,
      message: 'Team member added successfully'
    });
  } catch (error) {
    console.error('❌ Error creating team member:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to add team member',
      details: error.message
    });
  }
});

// PUT /api/team/:id - Update team member (Admin only)
router.put('/:id', authenticateAdmin, validateTeamMember, async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    res.json({
      success: true,
      data: teamMember,
      message: 'Team member updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update team member',
      details: error.message
    });
  }
});

// DELETE /api/team/:id - Remove team member (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndDelete(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove team member',
      details: error.message
    });
  }
});

// PUT /api/team/:id/toggle-active - Toggle active status (Admin only)
router.put('/:id/toggle-active', authenticateAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    teamMember.isActive = !teamMember.isActive;
    await teamMember.save();
    
    res.json({
      success: true,
      data: teamMember,
      message: `Team member ${teamMember.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle team member status',
      details: error.message
    });
  }
});

module.exports = router;
