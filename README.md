# VulnForge

> Intentionally vulnerable full-stack web application for cybersecurity training.

VulnForge is a local/private cybersecurity laboratory that behaves like a realistic web application while intentionally containing controlled security weaknesses for learning and exploitation practice.

## ⚠️ Lab Notice

VulnForge is intentionally insecure by design.

Run it only in an isolated local/private environment. Use synthetic data and lab-only credentials. Never point the application at production infrastructure or real user data.

## What You Practice

```text
Recon
  ↓
Enumeration
  ↓
Attack Surface Mapping
  ↓
Request Manipulation
  ↓
Vulnerability Discovery
  ↓
Exploitation
  ↓
Controlled Impact
  ↓
Evidence
  ↓
Defense / Remediation
  ↓
Retest
```

## Vulnerability Labs

- BOLA / IDOR
- SQL Injection
- XSS
- CSRF
- SSRF
- File Upload
- JWT weaknesses
- Business logic flaws
- Security misconfiguration

## Architecture

```text
Browser / Burp / ZAP / curl
            │
            ▼
React + TypeScript + Vite
            │
            │ HTTP / JSON
            ▼
Node.js + Express + TypeScript
            │
            ├── Core application
            ├── Authentication
            ├── Missions
            └── /api/lab/*
                    │
                    ▼
              Local Database
```

See [`docs/architecture.md`](docs/architecture.md) for the detailed diagrams and request flows.

## Repository Layout

```text
VulnForge/
├── AGENT.md
├── CODEX.md
├── PRD.md
├── README.md
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── missions.md
│   ├── security.md
│   └── threat-model.md
├── frontend/
└── backend/
```

## Local Development

### Backend

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

If the backend package has not been created yet, use `CODEX.md` as the implementation playbook.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment

Copy the example configuration:

```bash
cp .env.example .env
```

Never commit `.env`.

## Testing Workflow

Use the application normally first, then proxy the requests through Burp Suite or OWASP ZAP.

```text
Browser
   ↓
Burp / ZAP
   ↓
VulnForge
```

All security testing should stay inside the VulnForge lab.

## Documentation

- [`PRD.md`](PRD.md) — product requirements
- [`AGENT.md`](AGENT.md) — contributor/agent rules
- [`CODEX.md`](CODEX.md) — local implementation playbook
- [`docs/architecture.md`](docs/architecture.md) — architecture and workflows
- [`docs/api.md`](docs/api.md) — API design
- [`docs/missions.md`](docs/missions.md) — missions and evidence
- [`docs/security.md`](docs/security.md) — safety boundaries
- [`docs/threat-model.md`](docs/threat-model.md) — trust boundaries and assets

## License

Choose and add a license before public distribution.
