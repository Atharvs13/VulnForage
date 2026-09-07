# VulnForage backend

The backend is an Express 5 and TypeScript security-training service using
Node's built-in SQLite driver. Normal APIs enforce authentication, ownership,
and server-owned business rules. Deliberately vulnerable behavior exists only
below `/api/lab/*` and operates on synthetic local fixtures.

## Run and verify

Node.js 24.10+ is recommended (22.5+ remains supported by the current code).

```bash
cd backend
npm install
npm run db:reset
npm run dev
```

The service listens on `http://localhost:4000`; `GET /health` checks SQLite and
configuration. Use `npm run build`, `npm test`, and `npm run lint` before a
change is submitted. Runtime databases and uploads stay under `backend/data/`
and must not be committed.

## Architecture

`src/app.ts` composes middleware and routers; `src/server.ts` owns listening.
Core controllers call core services and never import vulnerable services.
`src/modules/labs/*` provides OWASP category composition points. A01 is the
reference implementation; established labs are exposed through category
adapters while their focused route/controller/service implementations remain
in their existing directories.

The lab platform is centered on:

- `src/lab/lab.registry.ts`: typed metadata and mission-to-event mapping.
- `src/lab/lab.context.ts`: authenticated request context for lab services.
- `src/lab/lab.events.ts`: structured, redacted exploit events.
- `src/lab/lab.fixtures.ts`: deterministic lab fixture restoration.
- `src/lab/lab.reset.ts`: per-lab transactional reset contract.
- `src/database/schema.ts` and `src/database/migrations/`: schema and upgrades.
- `src/services/mission.service.ts`: evidence validation against post-start events.

Success responses use `{ "success": true, "data": ... }`. Errors use
`{ "success": false, "error": { "code", "message", "requestId" } }` and never
include stack traces. Authentication uses an opaque `vf_session` cookie.

## A01 reference labs

- `VF-A01-001` (EASY): `GET /api/lab/orders/:id` omits ownership.
- `VF-A01-002` (MEDIUM): `GET /api/lab/users/:userId/orders/:orderId` checks the
  parent path value but not the child relationship.
- `VF-A01-003` (HARD): learners enumerate synthetic roles/resources, then call
  `PATCH /api/lab/access/resources/:id` with `X-Lab-Role-Id`; the flawed workflow
  trusts the supplied role without verifying its assignment.

The corresponding `GET /api/orders/:id` core endpoint always applies ownership.
A01 exploit events contain the learner ID, target/owner IDs, endpoint, method,
lab ID, request ID, and timestamp. Passwords, cookies, sessions, tokens, and
secrets are redacted or rejected.

## Mission and reset behavior

Starting a mission records a server-side attempt. Evidence must include the HTTP
method, `/api/lab/*` endpoint, changed parameter, response observation, and a
short explanation; a resource ID and event ID may also be supplied. Completion
requires a matching event recorded after `startedAt`. Client completion flags
have no effect.

Administrators can reset one lab with
`POST /api/admin/labs/:labId/reset` or all synthetic application/lab state with
`POST /api/admin/lab/reset`. CLI reset is `npm run db:reset`. Targeted reset
preserves sessions and unrelated labs; full reset invalidates sessions. Both
paths restore deterministic fixtures.

See [LABS.md](./LABS.md) for contributor conventions and curl/Burp workflows.
