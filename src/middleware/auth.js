const { verifyToken, extractTokenFromHeader } = require('../utils/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to req.user
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired access token',
        code: 'INVALID_TOKEN'
      });
    }

    // Check if token is an access token
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Fetch user from database to ensure they still exist
    const user = await prisma.appUser.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      roleId: user.role_id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-based access control middleware
 * @param {string|string[]} allowedRoles - Role(s) allowed to access the endpoint
 */
// const requireRole = (allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         error: 'Unauthorized',
//         message: 'Authentication required',
//         code: 'AUTH_REQUIRED'
//       });
//     }

//     const userRole = req.user.role;
//     const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

//     if (!roles.includes(userRole)) {
//       return res.status(403).json({
//         error: 'Forbidden',
//         message: 'Insufficient permissions',
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRoles: roles,
//         userRole: userRole
//       });
//     }

//     next();
//   };
// };

// /**
//  * Permission-based access control middleware
//  * @param {string|string[]} requiredPermissions - Permission(s) required
//  */
// const requirePermission = (requiredPermissions) => {
//   return async (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           error: 'Unauthorized',
//           message: 'Authentication required',
//           code: 'AUTH_REQUIRED'
//         });
//       }

//       const permissions = Array.isArray(requiredPermissions) 
//         ? requiredPermissions 
//         : [requiredPermissions];

//       // Check if user has any of the required permissions
//       const userPermissions = await prisma.rolePermission.findMany({
//         where: {
//           role_id: req.user.roleId,
//           permission: {
//             name: { in: permissions }
//           }
//         },
//         include: {
//           permission: true
//         }
//       });

//       const hasPermission = userPermissions.length > 0;

//       if (!hasPermission) {
//         return res.status(403).json({
//           error: 'Forbidden',
//           message: 'Insufficient permissions',
//           code: 'INSUFFICIENT_PERMISSIONS',
//           requiredPermissions: permissions,
//           userPermissions: userPermissions.map(p => p.permission.name)
//         });
//       }

//       next();
//     } catch (error) {
//       console.error('Permission check error:', error);
//       return res.status(500).json({
//         error: 'Internal Server Error',
//         message: 'Permission verification failed',
//         code: 'PERMISSION_CHECK_ERROR'
//       });
//     }
//   };
// };

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!req.app.locals.authAttempts) {
    req.app.locals.authAttempts = new Map();
  }

  const attempts = req.app.locals.authAttempts.get(clientIP) || [];
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000); // 15 minutes

  if (recentAttempts.length >= 5) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many authentication attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((15 * 60 * 1000 - (now - recentAttempts[0])) / 1000)
    });
  }

  recentAttempts.push(now);
  req.app.locals.authAttempts.set(clientIP, recentAttempts);

  next();
};

module.exports = {
  authenticateToken,
  // requireRole,
  // requirePermission,
  authRateLimit
};
