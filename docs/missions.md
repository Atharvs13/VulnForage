# VulnForge Mission System

## Purpose

Missions convert individual vulnerabilities into structured cybersecurity exercises.

A mission should tell the learner **what to investigate**, not simply reveal the exploit.

## Mission Model

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

## Mission States

```text
locked
   ↓
available
   ↓
in_progress
   ↓
completed
```

## Attempt Model

```text
mission_id
user_id
status
evidence
attempt_count
started_at
completed_at
```

## Difficulty

```text
Easy
Medium
Hard
```

Difficulty should describe the reasoning required, not merely the number of payloads.

---

## Mission Lifecycle

```mermaid
flowchart TD
    A["Mission Available"] --> B["Start Mission"]
    B --> C["Recon / Attack"]
    C --> D["Collect Evidence"]
    D --> E["Submit Attempt"]
    E --> F{ "Validator" }
    F -->|Pass| G["Completed"]
    F -->|Fail| H["Failed Attempt"]
    H --> C
    G --> I["Defense / Retest"]
```

---

# Starter Missions

## VF-001 — Access Another User's Order

**Category:** BOLA / IDOR

**Difficulty:** Easy

**Objective:** Identify whether an authenticated user can access another synthetic user's order by changing an object identifier.

**Target:**

```text
GET /api/lab/orders/:id
```

**Evidence:** Controlled request + response showing an order belonging to another synthetic user.

**Root cause:** Missing object ownership validation in the vulnerable lab implementation.

**Remediation:** Enforce server-side ownership/authorization checks.

---

## VF-002 — Find the SQL Injection Point

**Category:** SQL Injection

**Difficulty:** Medium

**Objective:** Identify the vulnerable product-search input and demonstrate controlled database-query manipulation.

**Target:**

```text
GET /api/lab/products/search?q=...
```

**Evidence:** Request/response pair demonstrating altered query behavior.

**Root cause:** Unsafe query construction in the lab module.

**Remediation:** Parameterized queries and proper input handling.

---

## VF-003 — Stored XSS in Support

**Category:** XSS

**Difficulty:** Medium

**Objective:** Identify an unsafe support-ticket rendering path and demonstrate controlled browser-side execution in the lab.

**Target:**

```text
POST /api/lab/xss/tickets
GET /api/lab/xss/tickets
```

**Evidence:** Stored payload and affected render context.

**Root cause:** Unsafe output handling.

**Remediation:** Context-aware output encoding/sanitization and safe rendering.

---

## VF-004 — Controlled SSRF

**Category:** SSRF

**Difficulty:** Hard

**Objective:** Identify the server-side fetch behavior and reach an explicitly allow-listed internal lab service.

**Target:**

```text
POST /api/lab/ssrf/fetch
```

**Evidence:** Request and synthetic internal-service response.

**Root cause:** Unsafe destination handling in the lab module.

**Remediation:** Strict allow-listing, network egress controls, and safe URL parsing.

---

## Evidence Strategy

Evidence should normally include:

- endpoint
- method
- relevant parameters/body
- interesting response
- short explanation of impact

Avoid requiring real-world targets or sensitive information.
