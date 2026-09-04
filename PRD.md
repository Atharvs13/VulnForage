# VulnForge Product Requirements Document

**Product:** VulnForge
**Type:** Intentionally vulnerable web application / cybersecurity training lab
**Primary goal:** Give learners a realistic application to recon, attack, exploit, document, remediate, and retest inside an isolated local/private environment.

---

## 1. Product Vision

VulnForge should feel like a normal modern web application from the learner's point of view.

Behind that realistic application are deliberately weak security controls and explicit vulnerability modules that create a safe attack surface for learning application security.

The product is **not** intended to be production secure. The lab environment itself must remain isolated and safe.

---

## 2. Target Users

### Learner

A cybersecurity student or practitioner who wants hands-on web security practice.

### Instructor / Maintainer

A person who adds missions, seeds data, resets the lab, and maintains the vulnerable scenarios.

---

## 3. User Journey

```text
Open VulnForge
    ↓
Register / Login
    ↓
Dashboard
    ↓
Choose Mission
    ↓
Recon
    ↓
Enumerate Attack Surface
    ↓
Intercept / Modify Requests
    ↓
Exploit Vulnerability
    ↓
Capture Evidence
    ↓
Submit Mission
    ↓
Mission Validation
    ↓
Defense / Remediation
    ↓
Retest
    ↓
Reset Lab
    ↓
Next Mission
```

---

## 4. Application Surface

### Public / User-facing pages

- Login
- Register
- Dashboard
- Products
- Product details
- Orders
- Order details
- Support
- Profile
- Missions

### Administrative pages

- Admin dashboard
- Users
- Orders
- Support tickets
- Mission management
- Lab reset

The admin area may be intentionally discoverable only through reconnaissance in selected missions.

---

## 5. Backend Requirements

Backend stack:

```text
Node.js
Express
TypeScript
Local database
```

Responsibilities:

- authentication
- sessions/tokens
- role handling
- users/profiles
- products
- orders
- payments lab data
- support tickets
- uploads
- admin operations
- missions
- mission validation
- lab reset
- event logging
- vulnerability modules

---

## 6. Database Requirements

Core entities:

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

### Required relationships

```text
users
 ├── profiles
 ├── orders
 ├── support_tickets
 ├── mission_attempts
 └── uploads

orders
 └── order_items
       └── products

missions
 └── mission_attempts
```

All records used in security exercises must be synthetic.

---

## 7. Roles

```text
guest
user
support
admin
```

The application should provide enough role separation to create authorization and privilege-boundary training scenarios.

---

## 8. Vulnerability Portfolio

VulnForge should contain explicit labs for:

| Lab | Training Goal |
|---|---|
| BOLA / IDOR | Object-level authorization failures |
| SQL Injection | Unsafe query construction |
| XSS | Unsafe rendering / output handling |
| CSRF | Missing/weak request integrity controls |
| SSRF | Unsafe server-side fetching in a lab-only target set |
| File Upload | Weak validation/access control |
| JWT | Token validation/claim weaknesses |
| Business Logic | Workflow and state manipulation |
| Misconfiguration | Discovery of weak configuration |

The initial milestone does not require every lab to be completed at once.

---

## 9. Vulnerability Isolation

All deliberate exploit surfaces should live under a clear lab namespace when practical:

```text
/api/lab/*
```

Each module must define:

- target endpoint
- input
- intended weakness
- expected impact
- evidence requirements
- root cause
- remediation

---

## 10. Mission System

A mission must contain:

```text
id
title
description
category
difficulty
objective
target
hints
expected_evidence
root_cause
remediation
status
```

Mission states:

```text
locked
available
in_progress
completed
```

Attempts must track:

```text
mission_id
user_id
status
evidence
attempt_count
started_at
completed_at
```

---

## 11. Modes

### Attack Mode

- Objective
- Target
- Minimal hints
- Learner performs reconnaissance and exploitation

### Guided Mode

- Progressive hints
- Conceptual help
- Methodology guidance

### Defense Mode

- Root cause
- Vulnerable design explanation
- Secure design
- Remediation
- Retest guidance

---

## 12. Logging

Record important lab events:

```text
LOGIN
AUTH_FAILURE
AUTHZ_FAILURE
MISSION_START
MISSION_COMPLETE
UPLOAD
LAB_RESET
```

Do not store passwords or real secrets in logs.

---

## 13. Lab Reset

The reset must return the lab to a deterministic state.

Resettable data includes:

- synthetic users
- products
- orders
- tickets
- uploads
- mission attempts
- lab settings

The schema/migrations must remain intact.

---

## 14. Safety Requirements

- Local/private deployment by default.
- Synthetic data only.
- No real credentials.
- No production systems.
- No arbitrary host access.
- SSRF only to controlled local targets.
- No unrestricted public-network exploitation features.
- No secrets committed to Git.

---

## 15. Non-Goals

VulnForge does not currently aim to provide:

- AI/LLM features
- production-grade security hardening
- real payment processing
- real customer data
- third-party production integrations
- public internet attack infrastructure

---

## 16. MVP Acceptance Criteria

The MVP is successful when a learner can:

1. Register and log in.
2. Browse realistic application pages.
3. Capture HTTP requests with Burp/ZAP.
4. Identify at least one intentionally vulnerable endpoint.
5. Exploit the vulnerability using synthetic data.
6. Submit evidence for a mission.
7. Receive a deterministic pass/fail result.
8. Read the root cause and remediation.
9. Reset the lab.
10. Repeat the exercise from a clean state.
