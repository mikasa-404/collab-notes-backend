require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // CORS configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  
  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Validation helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

module.exports = config;
