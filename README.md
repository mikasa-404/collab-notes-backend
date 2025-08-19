# Collaborative Notes Backend

A secure, scalable backend API for collaborative note-taking built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- 🔐 **JWT Authentication** with refresh token rotation
- 👥 **Role-based Access Control** (RBAC)
- 🔒 **Permission-based Authorization**
- 🛡️ **Security Best Practices** (rate limiting, input validation, CORS)
- 📝 **Note Management** with access control
- 🗄️ **PostgreSQL Database** with Prisma ORM
- 🚀 **Modern ES6+ JavaScript**

## Security Features

- **JWT Tokens**: Secure token-based authentication
- **Refresh Token Rotation**: Automatic refresh token renewal
- **Password Hashing**: Bcrypt with configurable rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: XSS protection, content type options
- **HTTP-Only Cookies**: Secure refresh token storage

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collab-notes-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed initial data (roles, permissions)
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `localhost:3000,3001` |
| `LOG_LEVEL` | Logging level | `info` |

## API Endpoints

### Authentication

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "15m"
}
```

#### `POST /api/auth/login`
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "15m"
}
```

#### `POST /api/auth/refresh`
Refresh access token using refresh token.

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "15m"
}
```

#### `POST /api/auth/logout`
Logout user and invalidate refresh token.

**Headers:** `Authorization: Bearer <access_token>`

#### `GET /api/auth/me`
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

#### `PUT /api/auth/change-password`
Change user password.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmNewPassword": "NewPass123"
}
```

### Health Check

#### `GET /api/health`
Server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## Authentication Flow

1. **Registration/Login**: User provides credentials
2. **Token Generation**: Server generates access token (15min) + refresh token (30 days)
3. **Token Storage**: Access token stored in memory, refresh token in HTTP-only cookie
4. **API Requests**: Include access token in `Authorization: Bearer <token>` header
5. **Token Refresh**: Use refresh token to get new access token when expired
6. **Logout**: Clear refresh token cookie

## Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Powered-By` header removed

## Rate Limiting

- **Authentication endpoints**: 5 attempts per 15 minutes per IP
- **Other endpoints**: No rate limiting (configurable)

## Database Schema

### Core Models

- **AppUser**: User accounts with email/password
- **Role**: User roles (admin, user, guest)
- **Permission**: System permissions
- **RolePermission**: Role-permission mappings
- **Note**: User notes with access control

### Default Roles & Permissions

- **Admin**: Full access to all features
- **User**: Create, edit, delete own notes, read notes
- **Guest**: Read public notes only

## Development

### Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run build        # Build TypeScript (if using TS)
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Data models
├── routes/          # API route definitions
├── utils/           # Utility functions
└── server.js        # Main server file
```

## Production Deployment

1. **Environment Variables**: Set all required environment variables
2. **JWT Secret**: Use a strong, unique secret key
3. **Database**: Use production PostgreSQL instance
4. **HTTPS**: Enable HTTPS in production
5. **CORS**: Configure allowed origins for production domains
6. **Rate Limiting**: Consider Redis-based rate limiting for scale
7. **Logging**: Implement proper logging and monitoring
8. **Backup**: Regular database backups

## Security Considerations

- **JWT Secret**: Must be strong and unique per environment
- **Password Policy**: Enforces minimum 8 characters with complexity
- **Token Expiry**: Short-lived access tokens (15min) with refresh capability
- **HTTPS Only**: Refresh tokens use secure cookies in production
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection**: Protected by Prisma ORM
- **XSS Protection**: Security headers and input sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For issues and questions, please create an issue in the repository.

