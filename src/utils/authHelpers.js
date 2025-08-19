const { generateAccessToken, generateRefreshToken } = require('./auth');
const cookieConfig = require('../config/cookies');

/**
 * Helper function to handle successful authentication
 * Generates tokens, sets cookies, and returns response data
 * 
 * @param {Object} user - User object with id, email, and role
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Response data with user info and access token
 */
const handleSuccessfulAuth = (user, res, message, statusCode = 200) => {
  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role.name
  });

  const refreshToken = generateRefreshToken({
    userId: user.id
  });

  // Set refresh token as HTTP-only cookie using config
  res.cookie('refreshToken', refreshToken, cookieConfig.refreshToken);

  // Prepare response data
  const responseData = {
    message,
    user: {
      id: user.id,
      email: user.email,
      role: user.role.name
    },
    accessToken,
    expiresIn: '15m'
  };

  // Send response with appropriate status code
  if (statusCode !== 200) {
    res.status(statusCode).json(responseData);
  } else {
    res.json(responseData);
  }

  return responseData;
};

/**
 * Helper function to refresh tokens
 * Generates new tokens and sets new refresh token cookie
 * 
 * @param {Object} user - User object with id, email, and role
 * @param {Object} res - Express response object
 * @returns {Object} Response data with new access token
 */
const handleTokenRefresh = (user, res) => {
  // Generate new access token
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role.name
  });

  // Generate new refresh token (rotate refresh tokens)
  const newRefreshToken = generateRefreshToken({
    userId: user.id
  });

  // Set new refresh token using config
  res.cookie('refreshToken', newRefreshToken, cookieConfig.refreshToken);

  const responseData = {
    message: 'Token refreshed successfully',
    accessToken: newAccessToken,
    expiresIn: '15m'
  };

  res.json(responseData);
  return responseData;
};

/**
 * Helper function to clear authentication cookies
 * 
 * @param {Object} res - Express response object
 */
const clearAuthCookies = (res) => {
  res.clearCookie('refreshToken', cookieConfig.refreshToken);
};

/**
 * Helper function to prepare user data for response
 * Removes sensitive information and formats the response
 * 
 * @param {Object} user - Raw user object from database
 * @returns {Object} Cleaned user object for response
 */
const prepareUserResponse = (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role?.name || user.role_name,
    created_at: user.created_at
  };
};

module.exports = {
  handleSuccessfulAuth,
  handleTokenRefresh,
  clearAuthCookies,
  prepareUserResponse
};
