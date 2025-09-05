const Joi = require('joi');

// Event validation schema
const eventSchema = Joi.object({
  type: Joi.string().valid('upcoming', 'past').required(),
  date: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    Joi.string().min(1).max(200)
  ).required(),
  title: Joi.string().required().min(1).max(200).trim(),
  description: Joi.string().required().min(1).max(1000).trim(),
  link: Joi.alternatives().try(
    Joi.string().uri(),
    Joi.string().allow('')
  ).optional(),
  linkText: Joi.string().max(50).optional().trim().allow(''),
  featured: Joi.boolean().optional(),
  image: Joi.alternatives().try(
    Joi.string().uri({ scheme: ['http', 'https', 'data'] }), // Allow http, https, and data URLs
    Joi.string().allow('')
  ).optional(),
  attendees: Joi.number().min(0).optional(),
  location: Joi.string().max(200).optional().trim().allow(''),
  organizer: Joi.string().max(100).optional().trim().allow(''),
  time: Joi.string().max(50).optional().trim().allow(''),
  tags: Joi.array().items(Joi.string().trim()).optional()
});

// // Team member validation schema
const teamMemberSchema = Joi.object({
  name: Joi.string().required().min(1).max(100).trim(),
  position: Joi.string().required().min(1).max(100).trim(),
  bio: Joi.string().required().min(1).max(500).trim(),
  initials: Joi.string().min(1).max(3).optional().trim().uppercase(),
  photo: Joi.alternatives().try(
    Joi.string().uri(), // Accept any valid URI
    Joi.string().allow('')
  ).optional(),
  email: Joi.string().email().optional().allow(''),
  linkedin: Joi.alternatives().try(
    Joi.string().uri(), // Accept any valid URI
    Joi.string().allow('')
  ).optional(),
  github: Joi.alternatives().try(
    Joi.string().uri(), // Accept any valid URI
    Joi.string().allow('')
  ).optional(),
  portfolio: Joi.alternatives().try(
    Joi.string().uri(), // Accept any valid URI
    Joi.string().allow('')
  ).optional(),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  joinDate: Joi.date().optional(),
  isActive: Joi.boolean().optional(),
  isCore: Joi.boolean().optional(),
  displayOrder: Joi.number().min(0).optional()
});

// Contact validation schema
const contactSchema = Joi.object({
  name: Joi.string().required().min(1).max(100).trim(),
  email: Joi.string().email().required(),
  subject: Joi.string().max(200).optional().trim(),
  message: Joi.string().required().min(1).max(2000).trim(),
  type: Joi.string().valid('general', 'join', 'collaboration', 'event', 'technical', 'other').optional()
});

// Middleware functions
const validateEvent = (req, res, next) => {
  console.log('Validating event data:', req.body); // Debug log
  const { error } = eventSchema.validate(req.body);
  
  if (error) {
    console.log('Validation error details:', error.details); // Debug log
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

const validateTeamMember = (req, res, next) => {
  console.log('🔍 Validating team member data:', req.body); // Debug log
  const { error } = teamMemberSchema.validate(req.body);
  
  if (error) {
    console.log('❌ Team member validation error details:', error.details); // Debug log
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

const validateContact = (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

module.exports = {
  validateEvent,
  validateTeamMember,
  validateContact,
  validate,
  schemas: {
    eventSchema,
    teamMemberSchema,
    contactSchema
  }
};
