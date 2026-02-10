# Faculty Achievement Tracking System - Architecture

## System Overview

This is a **hybrid role-based access control (RBAC)** system where:
- **Backend** enforces permissions and filters data at API level
- **Frontend** dynamically adapts UI based on user roles
- Single user can have multiple simultaneous roles
- Role assignments can change at any time without redeployment

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
├─────────────────────────────────────────────────────────────┤
│  - RoleGuard Component (hides/shows UI based on roles)       │
│  - Zustand Store (manages user state & roles)                │
│  - Dynamic Navigation (adapts menu items)                    │
│  - Role-based Page Components                                │
└────────────────────┬────────────────────────────────────────┘
                     │ JWT Token + Role Info
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Authentication Middleware                           │    │
│  │  - Validates JWT token                               │    │
│  │  - Extracts user roles from token                    │    │
│  │  - Verifies user is active                           │    │
│  └──────────────────────────────────────────────────────┘    │
│                     ↓                                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Role Authorization Middleware                       │    │
│  │  - Checks if user has required role for endpoint     │    │
│  │  - Returns 403 Forbidden if unauthorized             │    │
│  └──────────────────────────────────────────────────────┘    │
│                     ↓                                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Route Handlers & Business Logic                     │    │
│  │  - Filter data based on user's roles                 │    │
│  │  - Return only authorized data                       │    │
│  │  - Maintain data isolation by department/user        │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────┬────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┬─────────────┐
         ↓                         ↓             ↓
    PostgreSQL              Redis Cache       Email Service
    (Primary DB)           (Sessions/Cache)   (Notifications)
```

## Role-Based Access Flow

### Example 1: Faculty User

1. **Login**: Faculty user logs in with credentials
2. **Backend**: Validates credentials, queries `user_roles` table
3. **JWT Token Created**: `{ id: 1, email: "faculty@example.com", roles: ["faculty"] }`
4. **Frontend**: Stores token in localStorage, extracts roles
5. **UI Rendering**: `<RoleGuard role="faculty">` shows faculty-only components
6. **API Call**: When fetching activities, backend filters for `faculty_id = 1`

### Example 2: HOD User

1. **Login**: HOD logs in
2. **Backend**: Queries roles → finds `["faculty", "hod"]` for this user
3. **JWT Token**: `{ id: 5, roles: ["faculty", "hod"], departmentId: 3 }`
4. **Frontend**: Navigation shows both Faculty AND HOD sections
5. **API Calls**:
   - `/api/activities/my-activities` → Backend returns their activities
   - `/api/activities/department/3` → Backend returns department 3 data (because departmentId matches)
   - `/api/users` → Returns 403 (no "maintenance" role)

### Example 3: Admin Assigns New Role

1. **Frontend**: Admin clicks "Add HOD Role" for user
2. **Database**: New `UserRole` record created: `user_id=1, role_id=2, department_id=3`
3. **Frontend**: User refreshes page or token refreshes
4. **JWT**: New token includes `"hod"` role
5. **UI**: Department sections suddenly appear (no redeploy needed!)

## Data Flow for Protected Endpoint

```
User Request with JWT
         │
         ↓
├─ authenticateToken Middleware
│  ├─ Extract JWT
│  ├─ Verify signature
│  └─ Extract { id, email, roles, departmentId }
│
├─ requireRole('verification') Middleware
│  ├─ Check if roles.includes('verification')
│  └─ Return 403 if not found
│
├─ Route Handler
│  ├─ Query database WITH role-based filters
│  │  Example: WHERE user_id = :userId AND department_id = :departmentId
│  ├─ Filter results based on user's permissions
│  └─ Return filtered data
│
└─ Response to Frontend
   ├─ Frontend receives authorized data only
   └─ UI renders components based on roles
```

## Database Schema Design

### Key Tables for RBAC

**Users**: Core user information
```sql
- id (PK)
- email (unique)
- passwordHash
- name
- departmentId (FK)
- isActive
```

**Roles**: Available roles in system
```sql
- id (PK)
- roleName (e.g., 'faculty', 'hod', 'dean', 'verification', 'maintenance')
- description
```

**UserRoles**: Many-to-many relationship
```sql
- id (PK)
- userId (FK)
- roleId (FK)
- departmentId (FK, nullable)
- isPrimary (for default view)
- isActive
- UNIQUE(userId, roleId, departmentId)
```

This junction table enables:
- One user with multiple roles
- Department-specific roles (HOD of Dept A vs Dept B)
- Easy role assignment/removal without user table changes

## Frontend Role Checking

### 1. useRoles Hook
```typescript
const { hasRole, hasAnyRole, isFaculty, isHod, canApprove } = useRoles()

// Usage:
if (isHod()) {
  // Show HOD features
}
```

### 2. RoleGuard Component
```tsx
<RoleGuard role="faculty">
  <FacultyDashboard />
</RoleGuard>

<RoleGuard roles={['hod', 'dean']}>
  <LeadershipDashboard />
</RoleGuard>
```

### 3. Route Protection
```typescript
useEffect(() => {
  if (!isAuthenticated || !hasRole('verification')) {
    router.push('/dashboard')
  }
}, [])
```

## Backend Role Enforcement

### 1. Authentication Middleware
Verifies JWT and extracts roles into `req.user`

### 2. Authorization Middleware
```typescript
router.get('/pending', authenticateToken, requireRole('verification'), handler)
// Handler only executes if user has 'verification' role
```

### 3. Data Filtering in Handlers
```typescript
// Faculty: Get only their activities
const activities = await prisma.facultyActivity.findMany({
  where: { facultyId: req.user.id }
})

// HOD: Get department activities
const activities = await prisma.facultyActivity.findMany({
  where: {
    faculty: {
      departmentId: req.user.departmentId
    }
  }
})

// Dean: Get all activities
const activities = await prisma.facultyActivity.findMany({})
```

## API Endpoint Matrix

| Endpoint | Faculty | HOD | Dean | Verification | Maintenance |
|----------|---------|-----|------|--------------|-------------|
| POST /activities/submit | ✓ | ✓ | ✗ | ✗ | ✗ |
| GET /activities/my-activities | ✓ | ✓ | ✗ | ✗ | ✗ |
| GET /activities/pending | ✗ | ✗ | ✗ | ✓ | ✗ |
| POST /activities/:id/approve | ✗ | ✗ | ✗ | ✓ | ✗ |
| GET /activities/department/:id | ✗ | ✓ | ✓ | ✓ | ✗ |
| GET /college/statistics | ✗ | ✗ | ✓ | ✗ | ✗ |
| GET /users | ✗ | ✗ | ✗ | ✗ | ✓ |
| POST /users/:id/roles | ✗ | ✗ | ✗ | ✗ | ✓ |

## Security Principles

1. **Never Trust Frontend**: Backend always validates permissions
2. **Principle of Least Privilege**: Users get minimum required roles
3. **Role Immutability**: Roles defined in database, not code
4. **Audit Logging**: Track all role changes and sensitive operations
5. **JWT Expiration**: Tokens expire after 24h, forcing re-authentication
6. **HTTPS Only**: All API communication encrypted (in production)

## Deployment

### Docker Compose (Local Development)
```bash
docker-compose up
```
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Backend: localhost:5000
- Frontend: localhost:3000

### Production Deployment
1. Deploy backend to cloud (AWS, Heroku, Vercel)
2. Deploy frontend to Vercel or similar
3. Use managed PostgreSQL service
4. Enable HTTPS/TLS
5. Set production JWT secret
6. Configure CORS for frontend domain

## Performance Optimizations

1. **JWT Caching**: Tokens cached until expiration
2. **Database Indexing**: Indexes on `user_id`, `role_id`, `department_id`
3. **Redis Caching**: Cache role permissions and frequently accessed data
4. **GraphQL Alternative**: Consider for complex queries
5. **Request Batching**: Combine multiple API calls when possible

## Future Enhancements

1. **LDAP/Active Directory**: Integrate with institution directory
2. **Fine-grained Permissions**: Sub-role capabilities (e.g., "can_approve_research_only")
3. **Role Expiration**: Automatic role removal after set period
4. **Delegation**: Temporary permission transfer
5. **Audit Dashboard**: View all permission changes and sensitive actions
