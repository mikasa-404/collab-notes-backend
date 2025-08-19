const { body, validationResult } = require('express-validator');

/**
 * Sanitize and validate user input
 */
const sanitizeInput = (req, res, next) => {
  // Remove leading/trailing whitespace from string fields
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });

  // Remove any fields with undefined or null values
  Object.keys(req.body).forEach(key => {
    if (req.body[key] === undefined || req.body[key] === null) {
      delete req.body[key];
    }
  });

  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

/**
 * Check for validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Sanitize note content
 */
const sanitizeNoteContent = (req, res, next) => {
  if (req.body.content && typeof req.body.content === 'string') {
    // Remove HTML tags and limit length
    req.body.content = req.body.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
      .substring(0, 10000); // Limit to 10,000 characters
  }
  next();
};

/**
 * Validate note access level
 */
const validateAccessLevel = (req, res, next) => {
  if (req.body.access_level && !['PRIVATE', 'PUBLIC'].includes(req.body.access_level)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid access level. Must be either PRIVATE or PUBLIC',
      code: 'INVALID_ACCESS_LEVEL'
    });
  }
  next();
};

module.exports = {
  sanitizeInput,
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  handleValidationErrors,
  sanitizeNoteContent,
  validateAccessLevel
};
