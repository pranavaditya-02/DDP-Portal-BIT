# Faculty Achievement Dashboard

Faculty Achievement Dashboard is a full-stack web platform that helps institutions manage faculty performance workflows in one place.

It replaces scattered spreadsheets and manual follow-ups with a role-based system for submissions, approvals, analytics, and deadline reminders.

## Quick Summary

- Domain: Academic performance and compliance management
- Product Type: Internal workflow and analytics dashboard
- Users: Faculty, HOD, dean, verification team, admin, student
- Value: Faster tracking, better visibility, fewer missed deadlines

## Why This Project Matters

In many institutions, performance data is fragmented across sheets, forms, and email threads. This project consolidates the process into a single source of truth.

Key outcomes:
- Standardized submission and verification flow
- Transparent department and college-level progress
- Deadline awareness via automated alerts
- Better decision support with role-specific dashboards

## Highlights for Recruiters and Hiring Managers

This project demonstrates practical, production-oriented skills:

- Full-stack architecture design and execution
- RBAC-aware product design for multiple user personas
- API design, validation, and integration
- Data import workflows from external files
- Notification automation via email services
- Real-world frontend UX with scalable component architecture

## Feature Set

- Multi-role dashboard and navigation experience
- Faculty activity submission and self-tracking
- Verification queue for approval and rejection workflows
- Department and college views for leadership
- Deadline alerting and reminder emails
- Admin-managed email templates
- CSV import support for legacy academic records

## Architecture

Frontend:
- Built with Next.js App Router
- Shared components and role-aware navigation
- Centralized client state and API integration

Backend:
- Express REST API with modular routes
- Authentication and role-based authorization middleware
- Service layer for business logic and alerts
- MySQL connectivity for import-backed workflows

Repository references:
- Frontend pages: [app](app)
- Shared components: [components](components)
- Client state and API layer: [lib](lib)
- Backend source: [backend/src](backend/src)

## Tech Stack

Frontend:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- Recharts
- Framer Motion

Backend:
- Node.js
- Express
- TypeScript
- JWT auth middleware
- mysql2
- Nodemailer
- Multer
- Zod

Tooling:
- npm
- ESLint
- Docker Compose (available as baseline)

## Project Structure

```text
app/                             Application routes and pages
components/                      Reusable UI and dashboard components
hooks/                           Custom hooks (roles, alerts, data)
lib/                             API client, state store, workflow helpers
backend/                         Backend API project
backend/src/routes/              auth, activities, import, alerts
backend/src/services/            business services (alerts, email, import)
backend/src/database/            MySQL utilities
assets/                          Data files (CSV, SQL, JSON)
scripts/                         Data extraction and verification scripts
```

## Getting Started

## 1) Start Frontend

Run from repository root:

```bash
npm install
npm run dev
```

Open: http://localhost:3000

You can quickly explore the UI using demo login options on [app/login/page.tsx](app/login/page.tsx).

## 2) Start Backend

Run from [backend](backend):

```bash
npm install
npm run dev
```

Open health check:

```text
GET http://localhost:5000/api/health
```

## 3) Configure Environment

Create local [backend/.env](backend/.env) (this file is gitignored):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=change-me
ALLOWED_ORIGINS=http://localhost:3000

AUTH_BYPASS=true
AUTH_BYPASS_ROLES=admin,faculty,verification,hod,dean,student

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=your_database
MYSQL_SSL=false
```

Optional email setup:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=app-password
EMAIL_FROM=noreply@example.com
ALERT_NOTIFY_EMAIL=recipient@example.com
```

## API Overview

Auth APIs:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify
- GET /api/auth/me

Activity APIs:
- GET /api/activities/my-activities
- POST /api/activities/submit
- GET /api/activities/pending
- POST /api/activities/:activityId/approve
- POST /api/activities/:activityId/reject
- GET /api/activities/department/:departmentId
- GET /api/activities/stats/department/:departmentId

Import APIs:
- POST /api/import/events-attended/csv

Alert APIs:
- POST /api/alerts/check-and-send
- POST /api/alerts/send-bulk
- POST /api/alerts/task-completed
- GET /api/alerts/email-templates
- PUT /api/alerts/email-templates
- GET /api/alerts/verify-email
- GET /api/alerts/statistics

## Available Scripts

Root scripts from [package.json](package.json):
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run extract:ddp-indexing

Backend scripts from [backend/package.json](backend/package.json):
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm test

## Documentation

- [DOCS_INDEX.md](DOCS_INDEX.md)
- [GETTING_STARTED.md](GETTING_STARTED.md)
- [SETUP.md](SETUP.md)
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- [DEADLINE_ALERTS_SETUP.md](DEADLINE_ALERTS_SETUP.md)
- [EMAIL_ALERTS_IMPLEMENTATION.md](EMAIL_ALERTS_IMPLEMENTATION.md)
- [EMAIL_ALERTS_QUICK_START.md](EMAIL_ALERTS_QUICK_START.md)

## Security Notes

- Env files are excluded via [.gitignore](.gitignore)
- Keep credentials only in local environment files or secret managers
- Rotate any secret that may have been committed in the past

## Contributing

1. Create a feature branch from main.
2. Keep changes focused and well documented.
3. Validate frontend and backend startup before creating a PR.
4. Include testing notes in the PR description.

## License

Internal academic software project.
