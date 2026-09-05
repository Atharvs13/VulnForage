# VulnForge Architecture

## Implemented system

```text
Untrusted learner/browser/proxy
             │ HTTP, cookie, JSON, multipart
             ▼
React 19 + Router + Tailwind + Vite
             │ services/api.ts
             ▼
Express 5 + TypeScript
  request ID → CORS/JSON → session lookup → route/auth
       ├── controllers → core services → SQLite
       ├── mission service → event validator → SQLite
       └── /api/lab routers → isolated lab services
                                      ├── lab tables/settings
                                      └── bounded upload storage
```

The frontend is a static single-page client and never acts as an authorization boundary. The backend controls sessions, roles, resource ownership, core business calculations, mission state, evidence validation, reset, and structured events.

## Frontend architecture

`src/app` owns routing and authentication context. `components` contains layout/status primitives. `pages` implements public/auth, core commerce/support, missions/workbenches, and admin reset. `services/api.ts` owns cookie-aware requests and normalized errors. Important pages render loading, error, empty, and success states.

The dedicated XSS mission workbench is the only unsafe rendering context. Core support/profile content remains text-rendered.

## Backend architecture and request flow

```text
Route → authentication/role middleware → controller → service → DatabaseSync
  └──────────────────── centralized AppError/error JSON ────────────────┘
```

`createApp()` migrates/seeds the SQLite database idempotently, then installs request metadata, routes, 404 handling, and sanitized error handling. Every completed response records an `HTTP_REQUEST`; security and mission actions record named events without passwords, cookies, or tokens.

## Data architecture

SQLite is selected by the repository contract and embedded in the backend—there is no separate database server. The schema contains users, profiles, sessions, products, orders, order items, payments, tickets, uploads, missions, attempts, admin logs, lab settings, and isolated SQLi/XSS fixture tables. Foreign keys, checks, unique constraints, and lookup indexes protect core consistency.

Runtime state defaults to `backend/data/vulnforge.db`. Core and lab uploads live in separate non-source, non-executable directories.

## Authentication and authorization

Registration hashes passwords with salted scrypt. Login creates a random 256-bit opaque session identifier stored in SQLite and sent through an HTTP-only, SameSite cookie. Logout deletes it. Expiry is checked server-side. Core orders, tickets, and uploads apply ownership constraints; support/admin elevation is enforced in middleware/services. The JWT lab is unrelated to normal authentication and uses lab-only material.

## Mission flow

```text
available → POST start → in_progress → interact with lab target
   → server records mission-specific exploit event → POST evidence attempt
   → failed (no event) or completed → defense/retest unlocked
```

Evidence text alone cannot complete a mission. The validator requires both substantive evidence and a matching backend event recorded after the attempt started.

## Vulnerability boundary

All deliberate weaknesses live below `backend/src/modules` and mount under `/api/lab`. Each module has a route, controller, service, README, and remediation document. Core routes do not reuse vulnerable lab logic.

- SQLi queries only `lab_products`; SQLite single-statement preparation bounds the surface.
- SSRF accepts one exact synthetic URL and performs no arbitrary network operation.
- Lab files are size-limited, random-named, non-executable, and force-served as text.
- A01 BOLA (`VF-A01-001`) accesses real synthetic orders through `GET /api/lab/orders/:id`, records `LAB_BOLA_EXPLOITED` only for authenticated cross-user access, and remains separate from the ownership-scoped `/api/orders` core routes. CSRF changes a lab setting; business logic creates only a synthetic receipt.
- JWT and debug values are synthetic and independent of process/production secrets.

## Reset and deployment

CLI/API reset clears mutable rows and both upload stores, then reseeds deterministic IDs. It preserves schema/migrations and is idempotent. Sessions are intentionally cleared.

Direct development runs Vite on 5173, Express on 4000, and embedded SQLite. Docker builds separate frontend/backend images and stores SQLite in a named private volume. Compose publishes only to loopback. Trust boundaries are learner→frontend, browser/proxy→backend, user→other user/role, core→lab, backend→database/storage, and lab container→host/network.
