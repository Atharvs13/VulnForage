# VulnForge Threat Model

## Goal and assets

Selected application components are intentionally exploitable; the developer machine, network, process configuration, and any real data must remain protected. In-scope assets are synthetic identities/orders/tickets, lab files, mission state, SQLite state, lab-only secrets, and reset integrity. Protected assets include the host filesystem, cloud metadata, unrelated networks, public services, and real credentials.

## Actors and trust boundaries

The learner is authorized but fully controls browser state, methods, paths, parameters, headers, cookies, JSON, multipart files, and direct API traffic. A malicious request is therefore normal lab input.

```text
Learner/tools ──untrusted HTTP──> frontend (not a boundary)
Learner/tools ──untrusted HTTP──> backend
    backend core ──controlled queries/files──> SQLite/storage
    backend ──explicit internal boundary──> vulnerable modules
    lab container ──must not escape──> host/network
```

Privilege boundaries exist between users, user/support/admin, core/lab services, backend/database, and lab/host. Core endpoints enforce authorization; selected lab endpoints deliberately violate a specific control.

## Expected application threats

BOLA, SQLi, XSS, CSRF, weak upload validation, JWT claim tampering, price/workflow manipulation, and debug discovery are expected only in their documented `/api/lab/*` modules. Mission logs and deterministic fixtures make their impact observable and resettable.

## Infrastructure threats and mitigations

- **Host escape/file execution:** uploads use dedicated directories, randomized stored names, size limits, and non-executable text delivery. No command execution exists.
- **SSRF/network escape:** only one exact synthetic destination is recognized; no general fetch, DNS, redirect, file URL, metadata access, or port scanning exists.
- **Secret leakage:** responses/logs exclude passwords, session IDs, tokens, environment dumps, stack traces, and real secrets. Committed credentials are explicitly synthetic.
- **Public exposure:** Compose binds to `127.0.0.1`; documentation requires local/private deployment. No public ingress configuration is supplied.
- **Database crossover:** a dedicated disposable SQLite path is used; reset preserves schema and restores only synthetic fixtures.
- **Browser tampering:** expected and never used as an authorization boundary. Core checks remain backend-owned.
- **Denial/resource abuse:** JSON and uploads have size limits. The lab is single-host training software, not multi-tenant production infrastructure.

Risk priority is host/network/real-secret escape (critical), accidental core authorization weakness (high), and the documented synthetic vulnerabilities (expected). The key distinction is: **the training application is intentionally vulnerable; the infrastructure boundary is not.**
