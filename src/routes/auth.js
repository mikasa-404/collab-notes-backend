const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  authenticateToken, 
  authRateLimit 
} = require('../middleware/auth');
const {
  sanitizeInput,
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  handleValidationErrors
} = require('../middleware/validation');

// Public routes (no authentication required)
router.post('/register', 
  authRateLimit, 
  sanitizeInput, 
  validateRegistration, 
  handleValidationErrors,  
  authController.register
);

router.post('/login', 
  authRateLimit, 
  sanitizeInput, 
  validateLogin, 
  handleValidationErrors, 
  authController.login
);

router.post('/refresh', authController.refreshToken);

// Protected routes (authentication required)
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getProfile);
router.put('/change-password', 
  authenticateToken, 
  sanitizeInput, 
  validatePasswordChange, 
  handleValidationErrors, 
  authController.changePassword
);

module.exports = router;
