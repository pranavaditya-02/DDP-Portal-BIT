# Faculty Achievement Tracking System - Setup Guide

## Prerequisites

- Node.js 18+ (https://nodejs.org)
- PostgreSQL 14+ (https://www.postgresql.org)
- Redis 7+ (https://redis.io) - Optional, for caching
- Docker & Docker Compose (Optional, for containerized setup)
- Git (https://git-scm.com)

## Quick Start with Docker Compose

The easiest way to get started is using Docker:

```bash
# Clone or extract the project
cd faculty-tracking-system

# Start all services
docker-compose up

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

The database will be automatically initialized on first run.

## Manual Setup (Development)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your local settings
# For local development, use:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/faculty_tracking_db"
# REDIS_URL="redis://localhost:6379"
# JWT_SECRET="your_dev_secret_key"

# Setup database
npm run db:migrate

# Seed demo data (optional)
npm run db:seed

# Start backend server
npm run dev

# Backend will run on http://localhost:5000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (or root if using monorepo)
cd frontend
# OR if in root:
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev

# Frontend will run on http://localhost:3000
```

## PostgreSQL Setup (Manual)

If not using Docker:

```bash
# Create database
createdb faculty_tracking_db

# Create user
psql -d faculty_tracking_db
CREATE USER faculty_user WITH PASSWORD 'faculty_password';
GRANT ALL PRIVILEGES ON DATABASE faculty_tracking_db TO faculty_user;

# Run migrations
cd backend
npm run db:migrate
```

## Redis Setup (Optional but Recommended)

```bash
# Using Homebrew (macOS)
brew install redis
brew services start redis

# Using package manager (Linux)
sudo apt-get install redis-server
sudo systemctl start redis-server

# Using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

## Default Login Credentials

After database setup, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Faculty | faculty@example.com | password123 |
| HOD | hod@example.com | password123 |
| Dean | dean@example.com | password123 |
| Verification | verify@example.com | password123 |
| Maintenance (Admin) | admin@example.com | password123 |

> **Security Note**: Change these credentials immediately in production!

## Project Structure

```
faculty-tracking-system/
├── app/                          # Frontend Next.js app
│   ├── dashboard/                # Dashboard pages
│   ├── login/                    # Authentication
│   ├── activities/               # Activity management
│   ├── verification/             # Verification queue
│   ├── users/                    # User management
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── providers.tsx             # React providers
│
├── components/                   # Reusable components
│   ├── Navigation.tsx            # Main navigation
│   ├── RoleGuard.tsx            # Role-based access control
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Utilities
│   ├── api.ts                    # API client
│   ├── store.ts                  # Zustand store
│   └── utils.ts                  # Helper functions
│
├── hooks/                        # Custom React hooks
│   └── useRoles.ts              # Role checking hook
│
├── backend/                      # Express backend
│   ├── src/
│   │   ├── middleware/           # Auth, logging
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic
│   │   ├── database/             # Database client
│   │   ├── utils/                # Utilities
│   │   └── index.ts              # Server entry
│   │
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   │
│   ├── .env.example              # Environment template
│   └── package.json              # Dependencies
│
├── docker-compose.yml            # Docker services
├── ARCHITECTURE.md               # System architecture
├── README.md                     # Project overview
└── SETUP.md                      # This file
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/faculty_tracking_db"

# JWT
JWT_SECRET="change_this_in_production"
JWT_EXPIRY="24h"

# Server
PORT=5000
NODE_ENV="development"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASSWORD="your_password"
SMTP_FROM="noreply@facultytracking.com"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"
ALLOWED_FILE_TYPES="pdf,jpg,jpeg,png,docx,xlsx"

# CORS
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Logging
LOG_LEVEL="debug"
LOG_DIR="./logs"
```

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Application
NEXT_PUBLIC_APP_NAME=Faculty Achievement Tracking
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false
```

## Useful Commands

### Backend Commands

```bash
cd backend

# Development
npm run dev           # Start development server with hot reload
npm run build         # Build for production
npm start            # Start production build

# Database
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed demo data

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Testing
npm test            # Run tests
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production build
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
```

## Testing the System

### 1. Login with Different Roles

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Open browser
# http://localhost:3000

# Login with different credentials to test role-based UI
```

### 2. Test Role-Based API Access

```bash
# Get JWT token from login response
TOKEN="your_jwt_token_here"

# Test Faculty endpoint (should work for faculty user)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/activities/my-activities

# Test Verification endpoint (should fail for faculty user)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/activities/pending
# Should return 403 Forbidden

# Test with different user token to verify role-based filtering
```

### 3. Dynamic Role Testing

1. Login as faculty user
2. Navigate to http://localhost:3000/dashboard
3. Note: Only "My Activities" and "Submit Activity" are visible
4. In database, add 'hod' role to this faculty user
5. Refresh the page
6. Now "Department" and "Faculty Leaderboard" sections appear automatically!

```sql
-- Add HOD role to faculty user (faculty@example.com)
INSERT INTO user_roles (user_id, role_id, department_id, is_active)
SELECT u.id, r.id, 1, true
FROM users u, roles r
WHERE u.email = 'faculty@example.com' AND r.role_name = 'hod';
```

## Troubleshooting

### Backend Issues

**"Cannot find module '@prisma/client'"**
```bash
cd backend
npm install
npx prisma generate
```

**"ECONNREFUSED 127.0.0.1:5432"**
- PostgreSQL not running
- Solution: `docker-compose up -d postgres` OR check DB credentials in .env

**"Redis connection failed"**
- Redis is optional but recommended
- If not needed, remove redis calls from code OR start Redis: `docker-compose up -d redis`

### Frontend Issues

**"API endpoint unreachable"**
- Backend not running
- Wrong API_URL in .env.local
- CORS issue: Check `ALLOWED_ORIGINS` in backend .env

**"Hydration mismatch error"**
- This is a Next.js issue on first load
- Refresh the page or clear cache

**"Styles not loading"**
- Tailwind CSS not compiled
- Solution: Delete `.next` folder and restart: `rm -rf .next && npm run dev`

## Production Deployment

### Backend (Node.js)

```bash
# Build
npm run build

# Set production environment variables
export NODE_ENV=production
export JWT_SECRET="your_secure_secret"
export DATABASE_URL="production_db_url"

# Start
npm start
```

**Deploy to**: Heroku, Railway, AWS EC2, DigitalOcean, etc.

### Frontend (Next.js)

```bash
# Build
npm run build

# Test production build locally
npm start

# Deploy to Vercel (recommended)
npx vercel

# OR deploy to other platforms
```

**Deploy to**: Vercel (easiest), Netlify, AWS Amplify, etc.

### Database

Use managed PostgreSQL:
- AWS RDS PostgreSQL
- Azure Database for PostgreSQL
- Heroku PostgreSQL
- PlanetScale (MySQL alternative)

### Redis (Cache)

Use managed Redis:
- AWS ElastiCache
- Heroku Redis
- Upstash Redis (serverless)

## Performance Tuning

1. **Enable HTTP Caching**: Set appropriate cache headers
2. **Database Indexing**: Ensure indexes on frequently queried columns
3. **Redis Caching**: Cache role permissions and user data
4. **CDN**: Use CDN for static assets
5. **Database Optimization**: Run EXPLAIN ANALYZE on slow queries

## Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Enable database encryption
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Regular backups of database
- [ ] Use environment variables for secrets
- [ ] Update dependencies regularly

## Support & Resources

- **API Documentation**: See `backend/docs/API.md`
- **Architecture Details**: See `ARCHITECTURE.md`
- **Database Schema**: See `backend/prisma/schema.prisma`
- **Issues**: Create GitHub issue or check troubleshooting section
