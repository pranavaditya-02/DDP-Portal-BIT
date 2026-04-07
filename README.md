# Faculty Achievement Dashboard

A role-aware dashboard for tracking faculty activities, achievements, departmental progress, and compliance workflows.

This repository contains:
- A Next.js frontend (App Router) with many role-specific pages
- An Express backend with auth, activities, CSV import, and email alert APIs
- Assets and scripts for institutional data import and reporting

## Current Project State

The project has grown beyond its original scaffold. Some docs still describe an older architecture (for example, Prisma-first backend flows). This README reflects the current code in the workspace.

Important runtime notes:
- Frontend can be explored quickly using demo login buttons on the login page.
- Backend auth currently uses bypass mode for development (`AUTH_BYPASS=true`).
- MySQL connectivity is used for bulk import endpoints.
- Email alert features are implemented and configurable.

## Tech Stack

Frontend:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- Recharts

Backend:
- Express
- TypeScript
- JWT auth middleware
- MySQL (`mysql2`)
- Nodemailer
- Multer

## Repository Layout

```text
app/                    Next.js routes (dashboard, college, department, student, achievements, etc.)
components/             Shared UI and dashboard components
hooks/                  Custom hooks (roles, real data, deadline alerts)
lib/                    Client API layer, store, utilities, data adapters
backend/                Express API server
backend/src/routes/     auth, activities, import, alerts routes
assets/                 SQL/CSV/JSON source data and generated artifacts
scripts/                Data extraction and report generation scripts
```

## Quick Start

## 1) Frontend

From repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Sign in options:
- Use demo account buttons on the login page for UI-only exploration.
- Or use email/password sign-in if backend is running and configured.

## 2) Backend

From `backend` folder:

```bash
npm install
npm run dev
```

Backend health check:
- `GET http://localhost:5000/api/health`

### Minimal backend env keys

Create or update `backend/.env` with at least:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=change-me
ALLOWED_ORIGINS=http://localhost:3000

# Development auth mode
AUTH_BYPASS=true
AUTH_BYPASS_ROLES=admin,faculty,verification,hod,dean,student

# Required for MySQL-backed import features
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=your_database
MYSQL_SSL=false
```

Optional (email alerts):

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

## NPM Scripts

Root:
- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - start production frontend
- `npm run lint` - lint frontend
- `npm run extract:ddp-indexing` - generate DDP indexing artifact

Backend (`backend/package.json`):
- `npm run dev` - start backend with `tsx` + `nodemon`
- `npm run build` - compile backend TypeScript
- `npm run start` - run compiled backend
- `npm run db:migrate`, `npm run db:push`, `npm run db:studio`, `npm run db:seed` - legacy Prisma scripts (use only if your environment includes Prisma schema/migrations)

## Backend API Overview

Auth routes:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify`
- `GET /api/auth/me`

Activity routes:
- `GET /api/activities/my-activities`
- `POST /api/activities/submit`
- `GET /api/activities/pending`
- `POST /api/activities/:activityId/approve`
- `POST /api/activities/:activityId/reject`
- `GET /api/activities/department/:departmentId`
- `GET /api/activities/stats/department/:departmentId`

Import routes:
- `POST /api/import/events-attended/csv`

Alert routes:
- `POST /api/alerts/check-and-send`
- `POST /api/alerts/send-bulk`
- `POST /api/alerts/task-completed`
- `GET /api/alerts/email-templates`
- `PUT /api/alerts/email-templates`
- `GET /api/alerts/verify-email`
- `GET /api/alerts/statistics`

## Documentation

Project docs in this repository:
- `DOCS_INDEX.md`
- `GETTING_STARTED.md`
- `SETUP.md`
- `PROJECT_SUMMARY.md`
- `DEADLINE_ALERTS_SETUP.md`
- `EMAIL_ALERTS_IMPLEMENTATION.md`
- `EMAIL_ALERTS_QUICK_START.md`

Use these docs as feature references, but prefer code as source of truth if you notice discrepancies.

## Common Development Notes

- If login fails in local development, verify backend is running and `AUTH_BYPASS=true`.
- If import endpoints fail, verify MySQL connection details and DB accessibility.
- If email tests fail, validate SMTP config and app password usage (for Gmail).
- `docker-compose.yml` exists but currently reflects an older folder layout; validate before using it as-is.

## License

Internal academic project for faculty performance and achievement tracking.
