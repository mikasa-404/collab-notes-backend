const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'collab-notes-backend',
      audience: 'collab-notes-users',
    });
  } catch (error) {
    return null;
  }
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.security.bcryptRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Generate refresh token
 * @param {Object} payload - Data to encode in refresh token
 * @returns {string} Refresh token with longer expiry
 */
const generateRefreshToken = (payload) => {
  const refreshPayload = {
    userId: payload.userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(refreshPayload, config.jwt.secret, {
    expiresIn: '30d', // Longer expiry for refresh tokens
    issuer: 'collab-notes-backend',
    audience: 'collab-notes-users',
  });
};

/**
 * Generate short-lived access token
 * @param {Object} payload - Data to encode in access token
 * @returns {string} Access token with shorter expiry
 */
const generateAccessToken = (payload) => {
  const accessPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(accessPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn, 
    issuer: 'collab-notes-backend',
    audience: 'collab-notes-users',
  });
};

module.exports = {
  verifyToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader,
  generateRefreshToken,
  generateAccessToken,
};
