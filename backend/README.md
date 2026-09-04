# VulnForge Backend

Node.js 22.5+ + Express 5 + TypeScript backend using built-in SQLite, opaque
sessions, a service/controller split, mission event validation, deterministic
reset, and nine isolated vulnerability modules.

Read `../AGENT.md`, `../PRD.md`, `../CODEX.md`, and `../docs/api.md` before implementing new routes.

The default local database is SQLite. Keep runtime database files under `backend/data/` and out of Git.

Use `npm run db:reset`, `npm run dev`, `npm run build`, and `npm test`. The
backend is healthy when `GET /health` reports `database: reachable`.
