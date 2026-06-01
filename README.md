# SIBC Armoury & Firearms Management System (AFMS)

Production-focused web platform for firearm accountability, chain of custody, assignment tracking, ammunition reconciliation, and audit reporting.

## Stack

- Next.js (App Router) + TypeScript
- Ant Design
- TanStack Query
- Day.js
- PocketBase (auth, database, file storage)
- Docker + Docker Compose

## Implemented Solution Structure

```text
app/
  (auth)/login               Authentication entry
  (protected)/dashboard      KPIs and activity widgets
  (protected)/firearms       Inventory + registration form
  (protected)/personnel      Personnel directory
  (protected)/assignments    Assignment + return workflow UI
  (protected)/ammunition     Ammunition reconciliation
  (protected)/accessories    Accessory inventory
  (protected)/ownership      Ownership transfer history
  (protected)/history        Movement timeline
  (protected)/reports        Export entry points
  (protected)/users          Admin-only user management
  (protected)/settings       System settings
  api/auth/login             PocketBase password auth
  api/auth/logout            Session clear endpoint
components/
  layout/app-shell.tsx       Sidebar + header layout
  shared/providers.tsx       AntD + React Query providers
lib/
  pocketbase.ts              PocketBase client/auth helpers
  access-control.ts          Role helpers
data/mock.ts                 UI seed/mock records
types/domain.ts              Domain model types
pocketbase/schema.json       Collection schema definitions
pocketbase/seed.json         Seed data blueprint
```

## Security & Access Control

- Route protection enforced by `middleware.ts`
- Session cookie check (`pb_auth`)
- Role cookie (`safms_role`) for ADMIN/OFFICER permissions
- Admin-only access check applied on users module
- App design follows append-only movement and history principles

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

## PocketBase Setup

- Run PocketBase and import `pocketbase/schema.json` collection definitions.
- Load `pocketbase/seed.json` as initial data (or map through your migration scripts).
- Ensure `users.role` values are `ADMIN` or `OFFICER`.

## Docker Deployment

```bash
docker compose up --build
```

Services:
- Web app: `http://localhost:3000`
- PocketBase: `http://localhost:8090`

## Production Notes

- Provide secure `POCKETBASE_ADMIN_PASSWORD` and `POCKETBASE_OFFICER_PASSWORD` values before seeding.
- Enable HTTPS and secure cookie policy at the reverse proxy.
- Enforce PocketBase collection rules for officer visibility (`created_by = @request.auth.id`).
- Configure persistent backup strategy for PocketBase data volume.
- Wire report exports to server-side handlers for CSV/Excel/PDF generation.

## Lint & Build

```bash
npm run lint
npm run build
```
