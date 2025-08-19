/**
 * Cookie configuration for authentication
 */
const cookieConfig = {
  // Refresh token cookie settings
  refreshToken: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    path: '/api/auth/refresh'
  },
  
  // Access token cookie settings (if you want to use cookies for access tokens)
  accessToken: {
    httpOnly: false, // Access tokens should be accessible to JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: '/'
  }
};

module.exports = cookieConfig;
