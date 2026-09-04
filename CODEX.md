# CODEX.md — Local Implementation Playbook

Use this file as the execution playbook when Codex works on the VulnForge repository.

## Step 0 — Inspect Before Editing

Read:

```text
AGENT.md
PRD.md
README.md
docs/architecture.md
docs/api.md
docs/missions.md
docs/security.md
```

Then inspect the actual files under `frontend/` and `backend/`.

Never assume the repository is empty.

## Step 1 — Establish the Local Backend

Verify:

```bash
node --version
npm --version
```

Create/run the backend from `backend/` using Node.js + Express + TypeScript.

The default database is local SQLite. Store its runtime file outside source control, for example:

```text
backend/data/vulnforge.db
```

The database must be created from migrations/seed scripts rather than manually editing a DB file.

## Step 2 — Backend Foundation

Implement or verify:

```text
backend/src/server.ts
backend/src/app.ts
backend/src/config/
backend/src/routes/
backend/src/controllers/
backend/src/services/
backend/src/middleware/
backend/src/database/
backend/src/modules/
backend/src/types/
backend/src/utils/
```

Add:

```text
GET /health
```

The health endpoint should report application status and database connectivity without exposing secrets.

## Step 3 — Database

Create deterministic migrations and seed data for:

```text
users
profiles
products
orders
order_items
payments
support_tickets
uploads
missions
mission_attempts
admin_logs
lab_settings
```

Use only synthetic values.

Provide scripts such as:

```bash
npm run db:migrate
npm run db:seed
npm run db:reset
```

Exact script names may be adapted to the existing package.json, but keep equivalent functionality.

## Step 4 — API Contract

Match the frontend and `docs/api.md`.

Expected families:

```text
/api/auth/*
/api/users/*
/api/products/*
/api/orders/*
/api/support/*
/api/uploads/*
/api/admin/*
/api/missions/*
/api/lab/*
```

Do not invent endpoints solely because they look useful; prefer requirements derived from the repo.

## Step 5 — Core Application

Implement the realistic surrounding application first:

```text
register/login
products
product details
orders
order details
support tickets
profile
admin area
missions
```

## Step 6 — Vulnerability Labs

Implement each lab separately.

Recommended order:

```text
BOLA
SQLi
XSS
CSRF
File Upload
SSRF
JWT
Business Logic
Misconfiguration
```

For each lab add:

```text
README.md
route.ts
controller.ts
service.ts
remediation.md
```

or the repository's equivalent file organization.

## Step 7 — Mission Validation

A mission needs:

```text
mission definition
start
attempt
validation
completion state
```

Evidence should be enough to demonstrate the lab objective without requiring real-world targets.

## Step 8 — Reset

`db:reset` and/or a local admin reset must restore a known baseline:

```text
synthetic users
products
orders
support tickets
uploads
mission attempts
lab settings
```

Never destroy migration files during reset.

## Step 9 — Verification

At minimum run:

```bash
npm test
npm run build
npm run lint
```

when those scripts exist.

Start the app and manually check:

```text
GET /health
register
login
products
orders
missions
one lab endpoint
reset
```

## Step 10 — Final Report

At the end of each implementation task, summarize:

```text
Implemented
Modified
Added
Tests
How to run
Known TODOs
```

Do not claim a feature is implemented unless it exists and has been checked locally.
