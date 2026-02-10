# Getting Started - Faculty Achievement Tracking System

Welcome! This guide will get you up and running in 5 minutes.

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm version
npm --version

# Optionally, check Docker (for containerized setup)
docker --version
docker-compose --version
```

If any are missing, install from:
- Node.js: https://nodejs.org (choose LTS)
- Docker: https://docker.com

## Option 1: Docker Setup (Easiest - Recommended)

```bash
# Navigate to project root
cd faculty-tracking-system

# Start all services (database, cache, backend, frontend)
docker-compose up

# Wait for services to start (1-2 minutes first time)
# You'll see: "event message="listening""
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

**Done!** Skip to [Testing the System](#testing-the-system).

## Option 2: Manual Setup

### Step 1: Start PostgreSQL

Using Docker:
```bash
docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:16-alpine
```

Or install locally: https://www.postgresql.org/download

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env if using different PostgreSQL credentials
# Default works for Docker container above

# Setup database (creates tables and schema)
npm run db:migrate

# Start backend server
npm run dev

# You should see: "Server running on port 5000"
```

Keep this terminal open.

### Step 3: Setup Frontend

Open a new terminal:

```bash
# Navigate to project root
cd faculty-tracking-system

# Install dependencies (first time only)
npm install

# Start frontend development server
npm run dev

# You should see: "● Ready in 2.3s"
```

Open http://localhost:3000 in your browser.

## Testing the System

### 1. Login Page

You should see a login form with:
- Email and password fields
- Demo credentials display
- "Remember me" checkbox

### 2. Test Different Roles

Use these demo credentials:

```
Faculty User:
  Email: faculty@example.com
  Password: password123

HOD User:
  Email: hod@example.com
  Password: password123

Dean User:
  Email: dean@example.com
  Password: password123
```

### 3. Observe Role-Based UI

**With Faculty role:**
- Dashboard shows "My Activities" card
- Dashboard shows "Submit Activity" card
- Navigation only has these options

**With HOD role:**
- Dashboard shows "Department" card
- Dashboard shows "Faculty Leaderboard" card
- Navigation includes department menu

**With Dean role:**
- Dashboard shows "College Overview" card
- Different color scheme for dean features

### 4. Dynamic Role Update Test

This demonstrates the power of the system - no redeployment needed!

```bash
# In your database client (psql or PgAdmin):
# Find the user ID for faculty@example.com
SELECT id FROM users WHERE email = 'faculty@example.com';

# Add HOD role (replace 1 with actual user ID)
INSERT INTO user_roles (user_id, role_id, department_id, is_active)
SELECT 1, r.id, 1, true
FROM roles r
WHERE r.role_name = 'hod';

# Now in the browser:
# 1. Still logged in as faculty user
# 2. Refresh the page
# 3. New JWT is issued with HOD role
# 4. Dashboard now shows HOD features!
# 5. No code changes needed!
```

## Project Structure Quick Reference

```
faculty-tracking-system/
├── app/                    # Frontend (Next.js)
│   ├── login/             # Login page
│   ├── dashboard/         # Main dashboard
│   └── globals.css        # Design system
├── backend/               # Backend (Express)
│   ├── src/              # Source code
│   ├── prisma/           # Database schema
│   └── .env.example      # Config template
├── components/           # Shared components
├── lib/                  # Client utilities
├── hooks/                # Custom React hooks
├── README.md             # Project overview
├── SETUP.md              # Detailed setup
├── ARCHITECTURE.md       # System design
└── docker-compose.yml    # Docker config
```

## File Organization Explained

### Backend

| File | What It Does |
|------|-------------|
| `backend/src/index.ts` | Main server entry point |
| `backend/src/middleware/auth.ts` | JWT validation + role checking |
| `backend/src/services/*` | Business logic (auth, activities) |
| `backend/src/routes/*` | API endpoints (/auth, /activities) |
| `backend/prisma/schema.prisma` | Database tables definition |

### Frontend

| File | What It Does |
|------|-------------|
| `app/page.tsx` | Redirect to login/dashboard |
| `app/login/page.tsx` | Login form + demo creds |
| `app/dashboard/page.tsx` | Main dashboard (role-based) |
| `app/globals.css` | IndiGo design system |
| `components/Navigation.tsx` | Top navbar (role-aware) |
| `components/RoleGuard.tsx` | Conditional rendering |
| `lib/api.ts` | API client with auth |
| `lib/store.ts` | Auth state (Zustand) |
| `hooks/useRoles.ts` | Role checking utilities |

## Common Tasks

### Modify Login Credentials

Edit demo users in database:

```bash
# Connect to database
psql -U faculty_user -d faculty_tracking_db

# Change password (note: passwords are hashed)
# You'll need to hash the new password with bcrypt first
# Or use the application to register new users

# Add new role to user
INSERT INTO user_roles (user_id, role_id, department_id, is_active)
SELECT id, (SELECT id FROM roles WHERE role_name = 'dean'), NULL, true
FROM users
WHERE email = 'faculty@example.com';
```

### Check Database Tables

```bash
# Connect to PostgreSQL
psql -U faculty_user -d faculty_tracking_db

# List all tables
\dt

# View users
SELECT id, email, name FROM users;

# View user roles
SELECT ur.user_id, r.role_name, ur.department_id
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id;

# View roles
SELECT * FROM roles;
```

### View Backend Logs

```bash
# If running with "npm run dev", logs appear in terminal
# Check for errors like:
# - "Cannot connect to database"
# - "Redis connection failed" (this is optional)
# - "JWT verification failed"
```

### View Frontend Logs

```bash
# Browser developer console (F12)
# Check for errors like:
# - Network request failures
# - JWT token issues
# - Missing environment variables
```

## Environment Variables Reference

### Backend (.env)

```env
# Most important - CHANGE IN PRODUCTION
JWT_SECRET="your_secure_secret_key"

# Database connection
DATABASE_URL="postgresql://faculty_user:faculty_password@localhost:5432/faculty_tracking_db"

# Server
PORT=5000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```env
# Backend API location
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application name
NEXT_PUBLIC_APP_NAME=Faculty Achievement Tracking
```

## API Examples

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@example.com","password":"password123"}'

# Response:
# {
#   "message": "Login successful",
#   "token": "eyJhbGc...",
#   "user": {
#     "id": 1,
#     "email": "faculty@example.com",
#     "name": "Dr. Rajesh",
#     "roles": ["faculty", "hod"]
#   }
# }
```

### Get My Activities (Faculty)

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/activities/my-activities \
  -H "Authorization: Bearer $TOKEN"

# Returns: List of activities submitted by logged-in user
```

### Get Pending Activities (Verification Team)

```bash
TOKEN="verification_team_jwt_token"

curl -X GET http://localhost:5000/api/activities/pending \
  -H "Authorization: Bearer $TOKEN"

# Returns: All pending activities across all departments
# Faculty user would get: 403 Forbidden
```

## Troubleshooting

### "Cannot connect to database"

```bash
# Check if PostgreSQL is running
psql -U postgres

# If not running, start it:
# Docker: docker ps (check for postgres container)
# Local: sudo systemctl start postgresql

# Check connection string in .env
echo $DATABASE_URL
```

### "API not responding"

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Should return: {"status":"ok","timestamp":"2024-01-10T..."}

# If not running:
cd backend
npm run dev
```

### "Login failing"

```bash
# Check backend logs for error messages
# Try these accounts:
# - faculty@example.com / password123
# - hod@example.com / password123

# If still failing, check that database was migrated:
cd backend
npm run db:migrate
```

### "Styling looks broken"

```bash
# Clear Next.js cache
rm -rf .next

# Restart frontend
npm run dev
```

## Next Steps

### Learn the System
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand role-based flow
2. Read [SETUP.md](./SETUP.md) for deployment details
3. Explore backend code: `backend/src/routes/activity.routes.ts`
4. Explore frontend: `components/RoleGuard.tsx`

### Customize for Your Institution
1. Update department names in database
2. Modify activity types
3. Adjust role permissions
4. Customize colors in `app/globals.css`
5. Update logo in `components/Navigation.tsx`

### Add New Features
1. **New Activity Type**: Add to `activity_types` table, update frontend form
2. **New Role**: Add to `roles` table, implement role checks in backend
3. **New Dashboard Section**: Create page in `app/`, use `<RoleGuard>` for access
4. **API Endpoint**: Create in `backend/src/routes/`, add middleware

## Getting Help

### Documentation
- **Project Overview**: [README.md](./README.md)
- **System Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Setup & Deployment**: [SETUP.md](./SETUP.md)
- **Project Summary**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

### Common Issues
See [SETUP.md#troubleshooting](./SETUP.md#troubleshooting) for more issues and solutions.

### Code Examples
- Login flow: `app/login/page.tsx`
- Role-based UI: `app/dashboard/page.tsx`
- API client: `lib/api.ts`
- Role checking: `hooks/useRoles.ts`

## What's Included

This boilerplate provides everything needed for production:

- ✅ Secure JWT authentication
- ✅ Role-based access control (backend + frontend)
- ✅ PostgreSQL database with 15 tables
- ✅ RESTful API with error handling
- ✅ React components with Tailwind CSS
- ✅ IndiGo Airlines design system
- ✅ Docker setup for local development
- ✅ Comprehensive documentation

## What You Need to Add

To complete the system:

- [ ] Complete dashboard components for each role
- [ ] Activity submission form with file upload
- [ ] Verification queue UI
- [ ] Department leaderboard views
- [ ] Analytics and reporting
- [ ] Email notifications
- [ ] WebSocket for real-time updates
- [ ] User management interface

---

**Questions?** Check the documentation files or review the code - it's well-commented and organized.

**Ready to build?** Start with the dashboard components. They're the most visible part of the system and a great way to learn the role-based rendering pattern.

Happy building!
