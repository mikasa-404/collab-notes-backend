const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const notesRoutes = require('./notes');

// Mount authentication routes
router.use('/auth', authRoutes);

// Mount notes routes
router.use('/notes', notesRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'Collaborative Notes API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      notes: '/api/notes',
      health: '/api/health'
    },
    documentation: 'Coming soon...'
  });
});

module.exports = router;
