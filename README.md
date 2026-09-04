# VulnForge

VulnForge is a locally deployable, intentionally vulnerable commerce and support application for authorized cybersecurity training. Learners recon a realistic React application, modify requests, exploit controlled weaknesses, submit evidence, study remediation, retest, and reset the range.

> **Isolation warning:** run VulnForge only on localhost or a private disposable VM. Never connect it to production data, real credentials, public ingress, or unrelated systems.

## Implemented platform

- Registration, login/logout, opaque backend sessions, scrypt password hashes, and user/support/admin roles
- Products, checkout, orders, profiles, support tickets, safe core uploads, and admin views
- SQLite relational storage with deterministic schema, seed, and reset
- Nine isolated lab modules: BOLA, SQLi, XSS, CSRF, controlled SSRF, file upload, JWT, business logic, and misconfiguration
- Nine missions with attack workbenches, progressive hints, evidence attempts, server-event validation, defense mode, and retest guidance
- Structured request/security events, database-aware health check, strict TypeScript builds, tests, and Docker images

```text
Browser / Burp / ZAP / curl
          │ untrusted HTTP
          ▼
React + TypeScript + Vite (5173)
          │ JSON / multipart
          ▼
Express + TypeScript (4000)
   ├── secure core services
   ├── mission/event validator
   └── explicit /api/lab/* modules
          ▼
SQLite + non-executable local upload storage
```

SQLite is embedded in the backend, so no database daemon is needed. See [architecture](docs/architecture.md), [API](docs/api.md), [missions](docs/missions.md), [security](docs/security.md), and [threat model](docs/threat-model.md).

## Local setup

Node.js 22.5+ is required; Node 24 is recommended.

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run db:reset
npm run dev
```

Open <http://localhost:5173>. The API and health check are at <http://localhost:4000> and <http://localhost:4000/health>. Safe development defaults work without `.env`; export values from the example files when overriding them.

### Synthetic credentials

| Role | Email | Password |
|---|---|---|
| User | `user1@vulnforge.local` | `User1Lab!` |
| User | `user2@vulnforge.local` | `User2Lab!` |
| Support | `support@vulnforge.local` | `SupportLab!` |
| Admin | `admin@vulnforge.local` | `AdminLab!` |

The JWT mission separately uses `lab-learner / TrainingJWT!`. All credentials are synthetic and lab-only.

## Configuration

Backend variables: `NODE_ENV`, `PORT`, `LAB_MODE`, `DATABASE_URL`, `SESSION_SECRET`, `SESSION_TTL_HOURS`, `CORS_ORIGIN`, `UPLOAD_MAX_BYTES`, and synthetic `LAB_JWT_SECRET`. Frontend uses `VITE_API_URL`; an empty value uses the development proxy.

## Commands

```bash
npm run dev          # frontend and backend
npm run build        # production builds
npm test             # HTTP integration + UI routing tests
npm run lint         # strict TypeScript checks
npm run db:reset     # deterministic lab reset
npm run health       # query an already-running backend
npm run db:migrate -w backend
npm run db:seed -w backend
```

## Docker

```bash
docker compose up --build
```

Compose publishes services on `127.0.0.1` only. SQLite lives in the private `vulnforge-data` volume. Stop with `docker compose down`; add `-v` only when deliberately deleting that volume.

## Reset and contribution workflow

CLI reset and `POST /api/admin/lab/reset` restore synthetic users, products, orders, tickets, missions, fixtures, and settings; clear attempts, sessions, events, and uploads; and preserve the schema. API reset requires admin and signs everyone out.

Before proposing changes, run `npm run lint && npm run build && npm test`. Keep deliberate weaknesses inside `backend/src/modules`, add a corresponding mission validator/reset fixture, and document the weakness and remediation. VulnForge is a training application—not a hosted testing target.
