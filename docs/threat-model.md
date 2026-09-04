# VulnForge Threat Model

## Security Goal

Protect the **lab environment** and developer machine while deliberately making selected application components exploitable.

## Assets

```text
Synthetic user data
Synthetic orders
Synthetic tickets
Lab files
Mission state
Application configuration
Developer machine
```

## Actors

### Learner

Controls browser requests and may intentionally manipulate every client-controlled value.

### Malicious Input

Any request parameter, JSON body, header, cookie, or uploaded file may be attacker-controlled.

## Trust Boundaries

```text
Learner
   │
   │ untrusted HTTP
   ▼
Frontend
   │
   │ untrusted JSON
   ▼
Backend
   │
   ├── Core services
   ├── Vulnerability modules
   └── Mission engine
          │
          ▼
      Local database
```

## Threats

### T1 — Browser Tampering

Learner changes parameters or calls APIs directly.

**Expected:** The lab should allow this because it is fundamental to web-security training.

### T2 — Cross-User Access

Learner changes object identifiers.

**Expected:** Some missions deliberately expose BOLA behavior.

### T3 — Injection

Learner supplies unexpected database/query input.

**Expected:** Dedicated SQLi lab may be exploitable.

### T4 — Browser Script Injection

Learner supplies unsafe content.

**Expected:** Dedicated XSS lab may be exploitable.

### T5 — Server-Side Fetch Abuse

Learner manipulates a URL supplied to an SSRF exercise.

**Required protection:** Destination allow-list and isolated lab targets.

### T6 — Host Escape

A vulnerable feature is abused to reach the developer host.

**Required protection:** container/VM isolation, safe storage paths, no unrestricted command execution, no host mounts containing secrets.

### T7 — Secret Leakage

Secrets accidentally enter source code or logs.

**Required protection:** `.gitignore`, environment variables, synthetic values, review before commit.

## Risk Priorities

```text
Host escape / real-world exposure  → Critical
Public network access               → Critical
Real secret exposure                → Critical
Unrestricted SSRF                   → Critical
Cross-user lab data access          → Expected in selected labs
SQLi/XSS/CSRF/BOLA lab behavior     → Expected in selected labs
```

## Mitigations for the Lab Itself

- local/private deployment
- disposable database
- synthetic data
- dedicated vulnerable routes
- restricted SSRF targets
- restricted upload directories
- no real credentials
- reset capability
