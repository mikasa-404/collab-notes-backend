const { PrismaClient } = require('@prisma/client');
const { 
  hashPassword, 
  comparePassword
} = require('../utils/auth');
const {
  handleSuccessfulAuth,
  handleTokenRefresh,
  clearAuthCookies,
  prepareUserResponse
} = require('../utils/authHelpers');

const prisma = new PrismaClient();

/**
 * User registration
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Input validation is already handled by middleware
    // No need to validate again here

    const existingUser = await prisma.appUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default role (user)
    const user = await prisma.appUser.create({
      data: {
        email: email.toLowerCase(),
        pwhash: hashedPassword,
        role_id: 2, // Default to 'user' role
      },
      include: {
        role: true
      }
    });

    // Use helper function for authentication response
    handleSuccessfulAuth(user, res, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
};

/**
 * User login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation is already handled by middleware
    // No need to validate again here

    // Find user by email
    const user = await prisma.appUser.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.pwhash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Use helper function for authentication response
    handleSuccessfulAuth(user, res, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const { verifyToken } = require('../utils/auth');
    const decoded = verifyToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Check if user still exists
    const user = await prisma.appUser.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // Use helper function for token refresh
    handleTokenRefresh(user, res);

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
};

/**
 * User logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Use helper function to clear cookies
    clearAuthCookies(res);

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    // User info is already available from auth middleware
    const user = await prisma.appUser.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: {
          select: {
            name: true
          }
        },
        created_at: true
      }
    });

    // Use helper function to prepare user response
    const userResponse = prepareUserResponse(user);

    res.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user profile',
      code: 'PROFILE_ERROR'
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Input validation is already handled by middleware
    // No need to validate again here

    // Get current user with password hash
    const user = await prisma.appUser.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isValidCurrentPassword = await comparePassword(currentPassword, user.pwhash);
    if (!isValidCurrentPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.appUser.update({
      where: { id: req.user.id },
      data: { pwhash: hashedNewPassword }
    });

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to change password',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  changePassword
};
