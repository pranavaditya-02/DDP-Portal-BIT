# Faculty Achievement Tracking System

A **production-ready, role-based** faculty achievement tracking dashboard inspired by IndiGo Airlines' design aesthetic. Features comprehensive permission management, real-time updates, and seamless multi-role support.

## 🎯 Key Highlights

- **Hybrid RBAC**: Backend enforces permissions, frontend adapts UI dynamically
- **Multi-Role Support**: Single user can have multiple roles simultaneously
- **Real-Time Updates**: WebSocket-powered notifications and live features
- **Dynamic Permissions**: Role assignments change without redeployment
- **IndiGo Design**: Clean, professional navy blue aesthetic with smooth animations
- **Production-Ready**: Security, performance, and scalability built-in

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up

# Services available at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Database: localhost:5432
# Redis:    localhost:6379
```

### Manual Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev

# Frontend (new terminal)
npm install
cp .env.local.example .env.local
npm run dev
```

See [SETUP.md](./SETUP.md) for detailed instructions.

## 📁 Project Structure

```
faculty-tracking-system/
├── app/                          # Frontend (Next.js 16)
│   ├── dashboard/                # Role-based dashboards
│   ├── login/                    # Authentication
│   ├── activities/               # Activity management
│   ├── verification/             # Verification queue
│   ├── users/                    # User management
│   ├── globals.css               # IndiGo design tokens
│   └── layout.tsx                # Root layout
│
├── components/                   # Reusable components
│   ├── Navigation.tsx            # Role-aware navigation
│   ├── RoleGuard.tsx            # Conditional rendering
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Client utilities
│   ├── api.ts                    # Axios client with auth
│   ├── store.ts                  # Zustand auth store
│   └── utils.ts                  # Helper functions
│
├── hooks/                        # Custom hooks
│   └── useRoles.ts              # Role checking utilities
│
├── backend/                      # Express.js backend
│   ├── src/
│   │   ├── middleware/           # Auth & authorization
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic
│   │   ├── database/             # Prisma client
│   │   └── index.ts              # Server entry
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   └── .env.example              # Environment template
│
├── docker-compose.yml            # Docker services
├── ARCHITECTURE.md               # System design
├── SETUP.md                      # Setup guide
└── README.md                     # This file
```

## 🏗️ Architecture

### Role-Based Access Control Flow

```
User Request
    ↓
[Frontend] Check roles in JWT token
    ↓ (render UI conditionally)
[Frontend] Send request with JWT
    ↓
[Backend] Authenticate token
    ↓
[Backend] Check role authorization
    ↓
[Backend] Filter data based on role
    ↓
[Response] Only authorized data returned
```

### Example: Faculty vs HOD

**Faculty User Sees:**
- My Activities (own only)
- Submit Activity
- My Progress

**HOD Sees:**
- Faculty Leaderboard
- Department Dashboard
- Faculty Oversight
- Activity Distribution Charts
- *Plus* all Faculty features

**No Code Changes Needed**: Add 'hod' role in database → UI auto-adapts!

## 🔐 Security Features

### Backend (Server-Side)

- ✅ JWT authentication with role extraction
- ✅ Middleware-enforced authorization
- ✅ Role-based data filtering at query level
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ CORS configuration by environment
- ✅ Audit logging for sensitive operations

### Frontend (Client-Side)

- ✅ RoleGuard component for conditional rendering
- ✅ Secure token storage (localStorage + httpOnly ready)
- ✅ Automatic logout on unauthorized (401/403)
- ✅ Protected routes with role checks
- ✅ Zod validation for API responses

## 👥 Role System

| Role | Capabilities | Example Users |
|------|-------------|---------------|
| **Faculty** | Submit activities, view own data, track progress | Dr. Rajesh, Dr. Priya |
| **HOD** | Department oversight, faculty management | Dr. Suresh (Dept Head) |
| **Dean** | College-wide dashboards, all departments | Dean Kumar |
| **Verification** | Approve/reject activities, queue management | Dr. Verification Team |
| **Maintenance** | User management, system settings | System Admin |

**Key Point**: Users can have multiple roles simultaneously!
- Dr. Rajesh: `['faculty', 'hod']` → Sees faculty AND department features
- Dr. Priya: `['faculty', 'verification']` → Can submit AND approve activities

## 🎨 Design System - IndiGo Inspired

### Colors
- **Primary**: Deep Navy `#0B1B5E` (hero cards, main buttons)
- **Secondary**: Medium Navy `#1E3A8A` (hover states)
- **Accent**: Royal Blue `#3B82F6` (interactive elements)
- **Status**: Green `#10B981` (success), Orange `#F59E0B` (warning), Red `#EF4444` (danger)

### Typography
- **Heading**: Inter (sans-serif)
- **Numbers**: JetBrains Mono (tabular numerals)
- **Font Scale**: Display (56px) → Small (12px)

### Components
- Statistics cards with hover lift animation
- Smooth transitions (300ms ease)
- Responsive grid layouts (mobile-first)
- Role-based feature visibility

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/verify` - Verify token validity
- `GET /api/auth/me` - Get current user with roles

### Activities
- `GET /api/activities/my-activities` - User's activities (Faculty)
- `POST /api/activities/submit` - Submit new activity (Faculty)
- `GET /api/activities/pending` - Pending queue (Verification)
- `POST /api/activities/:id/approve` - Approve activity (Verification)
- `POST /api/activities/:id/reject` - Reject activity (Verification)
- `GET /api/activities/department/:id` - Department activities (HOD/Dean)

See [API Documentation](./backend/docs/API.md) for complete endpoint list.

## 🗄️ Database Schema

**Core Tables:**
- `users` - User accounts
- `roles` - Available roles (faculty, hod, dean, verification, maintenance)
- `user_roles` - Many-to-many user↔role relationships
- `departments` - Department information
- `faculty_activities` - Activity submissions
- `action_plans` - Faculty achievement goals
- `department_index` - Performance metrics

See [Prisma Schema](./backend/prisma/schema.prisma) for full details.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **State**: Zustand
- **HTTP**: Axios
- **Validation**: Zod + React Hook Form
- **Notifications**: React Hot Toast
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT (jsonwebtoken)
- **Cache**: Redis
- **Validation**: Zod
- **Logging**: Winston

## 📝 Demo Credentials

```
Email                   | Password    | Roles
─────────────────────────────────────────────────
faculty@example.com    | password123 | faculty
hod@example.com        | password123 | faculty, hod
dean@example.com       | password123 | dean
verify@example.com     | password123 | verification
admin@example.com      | password123 | maintenance
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup & deployment guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design & role flow
- **API Docs** - `backend/docs/API.md`
- **Database Schema** - `backend/prisma/schema.prisma`

## 🔄 How Role-Based UI Works

### 1. User Logs In
```typescript
// Backend returns JWT with roles
{ token: "jwt...", user: { id: 1, roles: ['faculty', 'hod'] } }
```

### 2. Frontend Stores Roles
```typescript
// Zustand store extracts and caches roles
useAuthStore.setState({ user: { roles: ['faculty', 'hod'] } })
```

### 3. Components Render Conditionally
```tsx
<RoleGuard role="hod">
  <DepartmentDashboard />
</RoleGuard>

// Only renders if user has 'hod' role!
```

### 4. Adding New Role (No Redeployment!)
```sql
-- Admin adds 'verification' role to user
INSERT INTO user_roles (user_id, role_id, ...)
VALUES (1, 4, ...)

-- User refreshes page → new JWT with 'verification'
-- Verification components auto-appear in UI!
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend type checking
npm run type-check

# Lint code
npm run lint
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v
docker-compose up
```

## 🚢 Deployment

### Recommended Platforms
- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Railway, Render, AWS EC2
- **Database**: AWS RDS PostgreSQL, Heroku PostgreSQL
- **Cache**: Upstash Redis, AWS ElastiCache

See [SETUP.md - Production Deployment](./SETUP.md#production-deployment) for details.

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimized (768px+)
- Desktop enhanced (1024px+)
- Touch-friendly controls
- Accessible color contrasts

## 🔗 Real-Time Features (Future)

- WebSocket notifications
- Live activity updates
- Instant approval notifications
- Department performance alerts

## 📄 License

Proprietary - Bannari Amman Institute of Technology

## 🤝 Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

---

**Made with ❤️ for Bannari Amman Institute of Technology**
