# AGENT.md — VulnForge Development Contract

## Mission

VulnForge is an intentionally vulnerable, local/private cybersecurity training web application. Build a realistic e-commerce/support-style web app whose **training attack surface is deliberately weak**, while keeping the lab itself isolated and disposable.

The project is for authorized security testing only. Use synthetic data and lab-only secrets.

## Source of Truth

Read these before making significant changes:

1. `PRD.md` — product scope and acceptance criteria
2. `docs/architecture.md` — system design and request flows
3. `docs/api.md` — API contracts
4. `docs/missions.md` — mission model and learner flow
5. `docs/security.md` — isolation and safety rules
6. `CODEX.md` — execution workflow for Codex

When documents conflict, update the documentation first, then implement the agreed design consistently across the codebase.

## Technology Direction

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Default local database: SQLite for simple zero-dependency local development
- Optional future database: PostgreSQL behind the same repository/service interfaces
- Authentication: backend-managed sessions or JWT, depending on the implementation already present
- Containers: Docker / Docker Compose where useful
- Security testing: Browser, Burp Suite, OWASP ZAP, curl, ffuf, Nmap against the local lab only

**Do not introduce Supabase or AI/LLM functionality unless the project owner explicitly asks for it.**

## Architecture Rules

### Frontend

The browser is untrusted. Never treat client-side validation, hidden buttons, or hidden routes as a security boundary.

### Backend

The backend owns:

- authentication
- authorization
- business logic
- database access
- admin actions
- mission validation
- lab reset
- security/lab event logging

### Vulnerability Isolation

Intentional vulnerabilities belong in explicit lab modules under:

```text
backend/src/modules/
├── sqli/
├── xss/
├── bola/
├── csrf/
├── ssrf/
├── file-upload/
├── jwt/
├── business-logic/
└── misconfiguration/
```

Prefer `/api/lab/*` for intentionally vulnerable endpoints so the attack surface is easy to identify, test, reset, and document.

Do not scatter accidental vulnerabilities throughout unrelated core code.

## Coding Rules

- TypeScript strict mode where practical.
- Small controllers; business logic belongs in services.
- Centralized error handling.
- Consistent JSON response shape.
- Environment-based configuration.
- Never commit `.env` or real secrets.
- Use synthetic credentials and lab values only.
- Add tests for every major module.
- Keep database migrations and seed/reset behavior deterministic.
- Avoid unnecessary dependencies.
- Keep APIs backward compatible when possible.

## Vulnerable-by-Design Rules

A vulnerability must be:

1. intentional
2. reproducible
3. isolated
4. documented
5. resettable
6. limited to synthetic lab data

A lab may deliberately omit a security control, but the omission must not accidentally expose the developer's host, real credentials, cloud metadata, production infrastructure, or arbitrary third-party systems.

### SSRF

SSRF exercises must only reach explicitly controlled local lab targets. Do not implement unrestricted internet access, cloud metadata access, arbitrary private-network scanning, or host-file access.

### File Upload

File-upload labs may demonstrate weak extension/MIME/path/access controls, but do not turn the lab into an unrestricted host-level code-execution mechanism.

### SQL Injection

Use a dedicated lab endpoint and synthetic records. Keep real application data separate from exploit fixtures where practical.

## Git Workflow

Branches:

```text
main
  └── develop
       ├── feature/*
       ├── lab/*
       ├── fix/*
       ├── docs/*
       └── test/*
```

Commit prefixes:

```text
feat: ...
lab: ...
fix: ...
test: ...
docs: ...
refactor: ...
chore: ...
```

Examples:

```text
feat: add local authentication flow
lab: add controlled BOLA scenario
test: cover mission validation
docs: update API contract
```

## Change Workflow

For each task:

```text
Read docs
  ↓
Inspect current code
  ↓
Identify dependencies
  ↓
Implement smallest coherent change
  ↓
Run tests
  ↓
Run application
  ↓
Verify API/UI behavior
  ↓
Update docs
  ↓
Commit with focused message
```

Do not rewrite working systems without a reason.

## Definition of Done

A change is complete when:

- the intended behavior works locally
- affected tests pass
- no unrelated functionality is broken
- docs match reality
- no secrets are added
- vulnerable behavior, where intentional, is clearly scoped to the lab
- reset behavior remains deterministic
