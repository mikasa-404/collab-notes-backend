# Collab Notes Backend

A collaborative notes backend API built with Node.js, Express, and Prisma.

## Features

- 🔐 Role-based authentication and authorization
- 📝 Note management with permissions
- 🗄️ PostgreSQL database with Prisma ORM
- 🛡️ Security best practices
- 🚀 Production-ready server setup

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd collab-notes-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npm run seed
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/collab_notes_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Security
BCRYPT_ROUNDS=12
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Seed database
npm run seed

# Open Prisma Studio
npx prisma studio
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/*` - API endpoints (coming soon)

## Project Structure

```
collab-notes-backend/
├── prisma/           # Database schema and migrations
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   └── generated/    # Generated files
├── index.js          # Server entry point
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Security Features

- CORS protection
- Security headers
- JWT authentication
- Role-based access control
- Input validation and sanitization
- Graceful shutdown handling

## Development Best Practices

- Use environment variables for configuration
- Implement proper error handling
- Add logging for debugging
- Write tests for critical functionality
- Use TypeScript for better type safety (optional)

## License

