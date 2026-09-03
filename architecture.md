# VulnForge — Detailed System Architecture

> **Purpose:** An intentionally vulnerable, isolated full-stack cybersecurity training laboratory for learning and practicing web security, API security, database security, authentication/authorization, business-logic testing, and AI security.

## 1. Project Vision

VulnForge simulates a realistic modern web application while keeping all data and attack surfaces synthetic and isolated.

Learners should be able to:

1. Create and authenticate a lab account.
2. Explore a realistic application.
3. Perform reconnaissance.
4. Discover hidden routes and APIs.
5. Intercept and modify requests with Burp Suite or OWASP ZAP.
6. Identify authentication and authorization weaknesses.
7. Test OWASP-style vulnerabilities.
8. Exploit controlled vulnerabilities using synthetic data.
9. Complete multi-step attack-chain missions.
10. Switch to Defense Mode and study remediation.
11. Reset the laboratory to a clean state.

**Safety boundary:** VulnForge must never connect to production systems or contain real credentials, customer data, or unrestricted host/network access.

---

## 2. Core Design Principles

### 2.1 Browser Is Untrusted

Everything originating from the frontend is attacker-controlled:

- URL parameters
- query parameters
- JSON bodies
- form fields
- cookies
- headers
- local storage
- client-side state

Security decisions must therefore be enforced server-side.

### 2.2 Backend Controls Sensitive Operations

The backend owns:

- authentication validation
- authorization
- privileged database operations
- admin operations
- AI tool execution
- mission validation
- lab reset
- security logging

Never expose the Supabase service-role key to the browser.

### 2.3 Vulnerabilities Are Intentional and Isolated

Recommended structure:

```text
modules/
├── auth/
├── users/
├── products/
├── orders/
├── admin/
├── uploads/
├── missions/
└── vulnerabilities/
    ├── sqli/
    ├── xss/
    ├── csrf/
    ├── ssrf/
    ├── bola/
    ├── jwt/
    ├── file-upload/
    └── business-logic/
```

Every vulnerability should define:

- objective
- target
- synthetic data
- expected evidence
- root cause
- remediation
- retest procedure

### 2.4 AI Is Sandboxed

AI tools must be explicitly allow-listed.

Allowed examples:

```text
searchProducts()
getOrder()
getSupportTicket()
getLabStats()
```

Do not provide unrestricted:

```text
executeShell()
executeSQL()
readFilesystem()
browseInternet()
runArbitraryCode()
```

---

# 3. High-Level Architecture

```text
                         ┌───────────────────────────┐
                         │        CYBER LEARNER      │
                         │ Browser / Burp / ZAP      │
                         └─────────────┬─────────────┘
                                       │ HTTP/HTTPS
                    ┌──────────────────▼──────────────────┐
                    │             FRONTEND                │
                    │ React + TypeScript + Vite           │
                    │ Tailwind CSS                         │
                    │ Dashboard • Auth • Orders • AI      │
                    │ Missions • Admin Lab                 │
                    └──────────────────┬──────────────────┘
                                       │ REST / JSON
                    ┌──────────────────▼──────────────────┐
                    │             BACKEND                 │
                    │ Node.js + Express + TypeScript     │
                    │ Auth • Authorization • Services     │
                    │ Vulnerability Modules • Missions    │
                    │ AI Orchestrator • Lab Reset         │
                    └──────────────┬───────────┬──────────┘
                                   │           │
                    ┌──────────────▼─────┐   ┌▼─────────────────┐
                    │      SUPABASE      │   │    AI SERVICE    │
                    │ PostgreSQL / Auth  │   │ Local LLM / API  │
                    │ Storage            │   │ Tool Gateway     │
                    └────────────────────┘   └──────────────────┘
```

---

# 4. Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Fetch/Axios
- Zod or equivalent validation

## Backend

- Node.js
- Express
- TypeScript
- REST API
- Authentication/session integration
- Structured logging
- Request validation

## Database

**Supabase PostgreSQL** is the central persistence layer.

Supabase provides:

- PostgreSQL
- Authentication
- Storage
- Row Level Security where appropriate

The backend remains the main application orchestration layer.

## AI

Possible providers:

- Ollama
- Local LLM
- OpenAI-compatible API
- Other controlled LLM provider

Provider-specific code should be hidden behind an internal AI service interface.

## Security Testing

- Burp Suite
- OWASP ZAP
- Nmap
- ffuf
- curl
- Browser DevTools
- SQLMap only against the local lab where appropriate

## Deployment

- Docker
- Docker Compose
- localhost/private network
- Optional isolated VM

---

# 5. Repository Architecture

```text
VulnForge/
├── README.md
├── PRD.md
├── AGENT.md
├── CODEX.md
├── .gitignore
├── docker-compose.yml
│
├── docs/
│   ├── architecture.md
│   ├── threat-model.md
│   ├── api.md
│   ├── missions.md
│   └── security.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── types/
│       └── utils/
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── modules/
│   │   ├── database/
│   │   ├── ai/
│   │   └── utils/
│   └── tests/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── README.md
│
└── scripts/
    ├── seed-lab
    ├── reset-lab
    └── health-check
```

---

# 6. Frontend Architecture

```text
frontend/src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── components/
│   ├── Layout/
│   ├── Navbar/
│   ├── Sidebar/
│   ├── Modal/
│   ├── Forms/
│   ├── Tables/
│   ├── MissionCard/
│   └── SecurityStatus/
├── pages/
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   ├── Products/
│   ├── Orders/
│   ├── Profile/
│   ├── Support/
│   ├── AIChat/
│   ├── Missions/
│   └── Admin/
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── orders.ts
│   ├── products.ts
│   ├── missions.ts
│   └── ai.ts
├── hooks/
├── types/
└── utils/
```

### Main pages

**Login/Register:** authentication and controlled authentication labs.

**Dashboard:** user information, orders, tickets, mission progress, lab status.

**Products:** synthetic catalog and injection/search labs.

**Orders:** order management and BOLA/IDOR/business-logic labs.

**Profile:** profile management, mass assignment and XSS scenarios.

**Support:** support tickets and stored-input scenarios.

**AI Chat:** AI security laboratory and conversation history.

**Missions:** objectives, hints, evidence, progress, and completion.

**Admin Lab:** intentionally restricted functionality. Hidden routing is a reconnaissance challenge, not the actual security boundary.

---

# 7. Backend Architecture

```text
HTTP Request
      ↓
Express Router
      ↓
Middleware
 ├── Authentication
 ├── Authorization
 ├── Validation
 ├── Logging
 └── Lab Context
      ↓
Controller
      ↓
Service
 ├───────────────┐
 ↓               ↓
Supabase       AI Service
```

Backend responsibilities:

- route handling
- request validation
- authentication
- authorization
- business logic
- vulnerability modules
- database access
- mission evaluation
- AI orchestration
- audit logging
- lab reset

---

# 8. Database Architecture

Core Supabase tables:

```text
profiles
users_lab_metadata
products
orders
order_items
payments_lab
support_tickets
admin_logs
api_keys_lab
uploaded_documents
missions
mission_attempts
ai_conversations
ai_tool_events
lab_settings
```

Relationship model:

```text
profiles
   ├──────────────┐
   ▼              ▼
orders       support_tickets
   │
   ▼
order_items
   │
   ▼
products

profiles
   │
   ▼
mission_attempts
   │
   ▼
missions

profiles
   │
   ▼
ai_conversations
   │
   ▼
ai_tool_events
```

---

# 9. Roles and Authorization

Recommended roles:

```text
guest
user
support
admin
```

| Role | User Data | Orders | Support | Admin |
|---|---|---|---|---|
| Guest | Public | No | No | No |
| User | Own | Own | Own | No |
| Support | Limited | Limited | Assigned | No |
| Admin | All Lab Data | All Lab Data | All | Yes |

Authentication answers **who you are**.

Authorization answers **what you can access**.

BOLA/IDOR labs can intentionally demonstrate what happens when ownership validation is missing or incorrectly implemented.

---

# 10. Authentication Architecture

```text
User
 ↓
Login
 ↓
Supabase Auth
 ↓
Session / Token
 ↓
Frontend
 ↓
Backend API
 ↓
Authentication Validation
 ↓
Protected Resource
```

Controlled labs may demonstrate:

- weak authentication
- account enumeration
- session weaknesses
- JWT issues

All credentials must be synthetic.

---

# 11. Vulnerability Architecture

Recommended vulnerability modules:

```text
vulnerabilities/
├── sqli/
├── xss/
├── csrf/
├── ssrf/
├── bola/
├── jwt/
├── file-upload/
├── business-logic/
├── security-misconfiguration/
├── sensitive-data/
├── api-security/
└── ai-security/
```

Each module should contain:

```text
module/
├── README.md
├── route.ts
├── controller.ts
├── service.ts
├── seed.ts
└── remediation.md
```

---

# 12. SQL Injection Lab

Conceptual flow:

```text
Learner
 ↓
Search API
 ↓
Input Processing
 ↓
Controlled Vulnerable Query
 ↓
Synthetic Database
```

Use only synthetic records such as:

```text
user_001
user_002
order_1001
product_2001
```

Learning sequence:

```text
Find input
 ↓
Identify injection behavior
 ↓
Understand query impact
 ↓
Capture evidence
 ↓
Learn parameterized-query remediation
 ↓
Retest
```

---

# 13. XSS Lab

Variants:

```text
Reflected XSS
Stored XSS
DOM-based XSS
```

Potential locations:

- search
- support ticket
- profile
- comments

The mission should teach discovery, impact, root cause, output encoding, and retesting.

---

# 14. CSRF Lab

```text
Victim Session
 ↓
Authenticated State-Changing Action
 ↓
Missing / Weak CSRF Protection
 ↓
Controlled State Change
```

Only synthetic accounts and state changes should be used.

---

# 15. SSRF Lab

```text
User Input URL
 ↓
Backend Fetcher
 ↓
Lab-only Internal Service
```

Do not provide unrestricted access to:

- public internet
- cloud metadata services
- host filesystem
- arbitrary internal networks

Only explicitly defined lab endpoints should be reachable.

---

# 16. File Upload Lab

```text
Upload
 ↓
Backend
 ↓
Validation
 ↓
Supabase Storage / Lab Storage
 ↓
Controlled File Processing
```

Possible lessons:

- extension validation
- MIME validation
- filename handling
- path handling
- content validation
- access control

---

# 17. JWT Lab

Teach:

- token structure
- claims
- signatures
- validation
- expiration
- authorization

Use dedicated synthetic tokens. Never reuse production credentials.

---

# 18. Business Logic Lab

Model realistic workflows:

```text
Cart
 ↓
Checkout
 ↓
Payment
 ↓
Order
 ↓
Fulfillment
```

Potential controlled flaws:

- quantity manipulation
- coupon abuse
- payment-state manipulation
- order-state manipulation
- privilege/role workflow errors

---

# 19. Hidden Admin / Recon

The admin interface should not be advertised in the normal navigation.

Potential discovery clues:

```text
robots.txt
sitemap.xml
JavaScript bundles
API routes
HTTP responses
error messages
documentation artifacts
```

Example chain:

```text
Recon
 ↓
Discover Hidden Route
 ↓
Enumerate API
 ↓
Identify Authentication
 ↓
Test Authorization
 ↓
Access Controlled Lab Resource
```

The hidden URL must never be the only protection.

---

# 20. API Architecture

Recommended routes:

```text
/api/auth/*
/api/users/*
/api/products/*
/api/orders/*
/api/support/*
/api/admin/*
/api/uploads/*
/api/missions/*
/api/ai/*
```

Example endpoints:

```text
GET    /api/products
GET    /api/products/:id

GET    /api/orders
GET    /api/orders/:id

POST   /api/orders
PATCH  /api/orders/:id

GET    /api/support/tickets
POST   /api/support/tickets

POST   /api/ai/chat

GET    /api/missions
POST   /api/missions/:id/attempt
```

API security lessons:

- BOLA
- broken authentication
- excessive data exposure
- mass assignment
- missing/weak rate limiting
- improper validation
- authorization flaws

---

# 21. AI Architecture

```text
User
 ↓
React AI Chat
 ↓
POST /api/ai/chat
 ↓
AI Controller
 ↓
AI Orchestrator
 ├── Conversation Context
 ├── System Instructions
 ├── Model Provider
 └── Tool Gateway
          ├── searchProducts()
          ├── getOrder()
          ├── getSupportTicket()
          └── getLabStats()
                    ↓
                 Supabase
```

The AI provider should be replaceable without changing the frontend.

---

# 22. AI Tool Gateway

Every tool should define:

```text
name
description
input schema
authorization requirement
allowed resources
output schema
logging policy
```

Example:

```text
getOrder(orderId)

Input:
orderId: string

Authorization:
user may access only their own order

Output:
synthetic order information
```

Unknown or unauthorized tool requests must be rejected.

---

# 23. AI Security Labs

### Prompt Injection

Demonstrate how untrusted content can influence model behavior.

### Sensitive Data Disclosure

Use fake values such as:

```text
VF_LAB_SECRET_001
SYNTHETIC_ADMIN_NOTE
TRAINING_TOKEN_ABC
```

### Excessive Agency

Demonstrate risks caused by giving an AI more permissions than necessary.

### Insecure Tool Authorization

Example:

```text
AI
 ↓
getOrder(orderId)
 ↓
Missing ownership check
 ↓
Another synthetic user's order
```

### Context Leakage

Demonstrate improperly scoped conversation/context data.

### System Prompt Exposure

Teach why hidden prompts should not contain secrets and should not be treated as a reliable security boundary.

---

# 24. AI Security Boundary

```text
                 AI MODEL
                    ↓
              Tool Request
                    ↓
             Tool Gateway
                    ↓
              Authorization
               /                   Allowed       Rejected
             ↓
      Controlled Service
             ↓
          Supabase
```

The model must never directly receive:

- database credentials
- Supabase service-role credentials
- unrestricted shell access
- unrestricted filesystem access
- unrestricted network access

---

# 25. Mission Engine

Mission fields:

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

Example:

```text
Mission:
Access Another User's Order

Category:
API Security / BOLA

Difficulty:
Medium

Objective:
Identify an authorization weakness in the order API.

Target:
GET /api/orders/:id

Expected Evidence:
A controlled request demonstrating access to another synthetic order.

Root Cause:
Missing resource ownership validation.

Remediation:
Perform server-side authorization checks.
```

Mission state:

```text
locked
available
in_progress
completed
```

`mission_attempts` can store:

```text
id
mission_id
user_id
started_at
completed_at
status
evidence
attempt_count
```

---

# 26. Attack Chain Architecture

Advanced missions can combine multiple vulnerabilities:

```text
Recon
 ↓
Hidden Admin Route
 ↓
Authorization Weakness
 ↓
Restricted Resource
 ↓
Input Vulnerability
 ↓
Database Impact
 ↓
Synthetic Sensitive Data
 ↓
AI Security Scenario
```

Each stage should remain independently testable and resettable.

---

# 27. Lab Modes

## Attack Mode

Minimal guidance:

- target
- objective
- environment

Learner performs independent testing.

## Guided Mode

Provides:

- hints
- concepts
- progressive guidance
- remediation explanation

## Defense Mode

Provides:

- root cause
- vulnerable design explanation
- secure design
- remediation
- retesting instructions

---

# 28. Lab Reset Architecture

```text
RESET LAB
 ↓
Clear temporary records
 ↓
Restore seed users
 ↓
Restore products
 ↓
Restore orders
 ↓
Restore support tickets
 ↓
Restore synthetic files
 ↓
Reset AI conversations
 ↓
Reset mission attempts
 ↓
Restore lab settings
 ↓
CLEAN LAB
```

Reset must affect only the VulnForge environment.

---

# 29. Synthetic Data

All data must be obviously synthetic.

Example:

```text
users:
atharv.lab@example.test
alex.lab@example.test
admin.lab@example.test

orders:
VF-10001
VF-10002
VF-10003

API keys:
vf_test_key_001
vf_test_key_002
```

Never use:

- real passwords
- real API keys
- cloud credentials
- real customer data
- production database dumps

---

# 30. Logging

Recommended fields:

```text
timestamp
user_id
request_id
route
method
status_code
mission_id
event_type
metadata
```

Events:

```text
LOGIN
AUTH_FAILURE
AUTHZ_FAILURE
MISSION_START
MISSION_COMPLETE
AI_TOOL_CALL
AI_TOOL_DENIED
LAB_RESET
UPLOAD
```

Avoid logging unnecessary sensitive input.

---

# 31. Error Handling

Use consistent API errors:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  },
  "requestId": "vf-request-001"
}
```

Some intentionally verbose errors may exist inside a dedicated lab, but diagnostic leakage must never accidentally expose real infrastructure secrets.

---

# 32. Environment Configuration

Use environment variables:

```text
NODE_ENV=development

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

AI_PROVIDER=
AI_BASE_URL=
AI_MODEL=

LAB_MODE=true
```

Commit only:

```text
.env.example
```

Never commit a real `.env`.

---

# 33. Supabase Security Model

```text
Frontend
   │
   └── Public client configuration only

Backend
   │
   └── Privileged server-side configuration
```

The service-role key remains server-side.

RLS should be used where appropriate. Vulnerable behavior should be implemented deliberately rather than by accidentally exposing the entire database.

---

# 34. Docker Architecture

Recommended:

```text
docker-compose
├── frontend
├── backend
└── optional-ai
```

Supabase can be hosted in a dedicated development project or run locally when needed.

Recommended local network:

```text
vulnforge-network
```

Expose only required ports to the host.

---

# 35. Network Isolation

```text
Internet
   X
   │
   ▼
VulnForge Network
   ├── Frontend
   ├── Backend
   └── AI
```

Prefer:

```text
localhost
```

or a private lab VM/network.

Do not publicly expose intentionally vulnerable endpoints.

---

# 36. Security Testing Workflow

```text
1. Start Lab
      ↓
2. Register/Login
      ↓
3. Browse Application
      ↓
4. Proxy Traffic Through Burp
      ↓
5. Recon
      ↓
6. API Discovery
      ↓
7. Identify Attack Surface
      ↓
8. Test Vulnerability
      ↓
9. Capture Evidence
      ↓
10. Complete Mission
      ↓
11. Defense Mode
      ↓
12. Apply/Understand Fix
      ↓
13. Retest
      ↓
14. Reset Lab
```

All testing must target only the local VulnForge environment.

---

# 37. Testing Layers

## Unit Tests

Test:

- services
- validators
- authorization functions
- mission logic
- AI tool schemas

## Integration Tests

Test:

- API + database
- authentication
- authorization
- mission completion
- lab reset
- AI tool gateway

## Security Tests

Use:

- Burp Suite
- OWASP ZAP
- curl
- browser DevTools
- Nmap
- ffuf

---

# 38. Threat Model

Potential lab attacker profiles:

```text
Unauthenticated learner
Authenticated low-privilege user
Compromised lab user
Malicious AI input
Tampered HTTP request
Modified JSON body
Modified URL parameters
Altered lab token
```

Assets:

```text
Synthetic user data
Synthetic orders
Synthetic tickets
Synthetic API keys
Mission state
AI conversations
Lab configuration
```

Security boundaries:

```text
Browser → Backend
User → Other User
User → Admin
AI → Tools
Tool → Database
Lab → Host
Lab → Internet
```

---

# 39. Security Requirements

VulnForge must:

- use synthetic data
- remain isolated
- support full reset
- avoid production credentials
- avoid unrestricted AI tools
- avoid arbitrary host command execution
- avoid unrestricted network access
- keep privileged secrets server-side
- clearly identify vulnerable modules internally
- provide remediation guidance
- maintain predictable lab state

---

# 40. Development Phases

### Phase 1 — Foundation

- repository
- architecture
- Docker
- frontend skeleton
- backend skeleton

### Phase 2 — Database

- Supabase project
- schema
- seed data
- repositories

### Phase 3 — Authentication

- registration
- login
- sessions
- profile

### Phase 4 — Authorization

- roles
- permissions
- order ownership
- BOLA lab

### Phase 5 — Web Vulnerabilities

- SQL injection
- XSS
- CSRF
- file upload
- SSRF

### Phase 6 — API Security

- API discovery
- BOLA
- mass assignment
- excessive data exposure
- rate-limit lessons

### Phase 7 — Recon

- hidden admin
- robots.txt
- API discovery
- error/route artifacts

### Phase 8 — Advanced Web Security

- JWT
- business logic
- security misconfiguration
- sensitive data exposure

### Phase 9 — AI

- AI chat
- model provider
- context
- tools
- logging

### Phase 10 — AI Security

- prompt injection
- data disclosure
- excessive agency
- tool authorization
- context leakage

### Phase 11 — Mission Engine

- mission definitions
- attempts
- evidence
- scoring
- attack chains

### Phase 12 — Defense

- remediation
- secure mode
- retesting

### Phase 13 — Hardening

- reset
- tests
- documentation
- Docker isolation
- security review

---

# 41. Recommended 20-Day Build Order

```text
Day 1   Architecture + Repository
Day 2   Supabase Schema + Seed
Day 3   Authentication
Day 4   Authorization / BOLA
Day 5   Injection Lab
Day 6   XSS
Day 7   CSRF / Sessions
Day 8   File Upload
Day 9   SSRF
Day 10  API Security
Day 11  Hidden Admin / Recon
Day 12  Business Logic
Day 13  JWT
Day 14  AI Integration
Day 15  AI Security
Day 16  Attack Chains
Day 17  Defense Mode
Day 18  Mission Engine
Day 19  UI / UX
Day 20  Testing + Reset + Documentation
```

---

# 42. Git Strategy

Recommended branches:

```text
main
develop
feature/*
lab/*
fix/*
docs/*
```

Examples:

```text
feature/supabase-schema
feature/authentication
lab/bola
lab/xss
lab/sqli
feature/ai-security
```

Commit examples:

```text
feat: add authentication flow
feat: add mission engine
lab: add controlled BOLA scenario
lab: add XSS training module
fix: correct order authorization
docs: update architecture
test: add API authorization tests
```

---

# 43. Repository Safety

Never commit:

```text
.env
real API keys
real Supabase service keys
cloud credentials
personal data
production database dumps
real customer information
```

Use `.env.example`.

Once intentionally vulnerable implementation is added, keeping the repository private is strongly recommended.

---

# 44. Final Architecture

```text
                         ┌──────────────────────────┐
                         │       SECURITY LEARNER   │
                         │ Browser / Burp / ZAP     │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │      REACT FRONTEND      │
                         │                          │
                         │ Auth                     │
                         │ Dashboard                │
                         │ Products                 │
                         │ Orders                   │
                         │ Support                  │
                         │ AI Chat                  │
                         │ Missions                 │
                         │ Admin Lab                │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │     NODE + EXPRESS       │
                         │                          │
                         │ Routes                   │
                         │ Middleware               │
                         │ Auth                     │
                         │ Authorization            │
                         │ Services                 │
                         │ Vulnerability Modules    │
                         │ Mission Engine           │
                         │ Reset Engine             │
                         │ AI Orchestrator          │
                         └───────┬─────────┬────────┘
                                 │         │
                  ┌──────────────▼───┐   ┌▼─────────────────┐
                  │     SUPABASE     │   │    AI SERVICE    │
                  │ PostgreSQL       │   │ Local LLM / API  │
                  │ Auth             │   │ Context          │
                  │ Storage          │   │ Tool Gateway     │
                  └──────────────────┘   └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Controlled AI   │
                                          │ Tools           │
                                          │ Products        │
                                          │ Orders          │
                                          │ Tickets         │
                                          │ Lab Stats       │
                                          └─────────────────┘
```

---

# 45. Definition of Done

- [ ] Frontend and backend communicate correctly
- [ ] Supabase schema is reproducible
- [ ] Seed data is deterministic
- [ ] Authentication works
- [ ] Roles are implemented
- [ ] Vulnerability modules are isolated
- [ ] Synthetic data is used everywhere
- [ ] AI is sandboxed
- [ ] AI tools are allow-listed
- [ ] Missions can be started and completed
- [ ] Evidence can be recorded
- [ ] Defense Mode explains remediation
- [ ] Lab can be completely reset
- [ ] Docker setup works
- [ ] Security tests pass
- [ ] No real secrets are committed
- [ ] Application is not publicly exposed
- [ ] Documentation is complete

---

# 46. Guiding Principle

VulnForge should feel like a **real modern application from the attacker's perspective**, while remaining a **controlled cybersecurity laboratory from the infrastructure perspective**.

The core learning loop is:

```text
Recon
  ↓
Understand
  ↓
Test
  ↓
Exploit
  ↓
Observe Impact
  ↓
Understand Root Cause
  ↓
Fix
  ↓
Retest
  ↓
Reset
```

That feedback loop is the heart of VulnForge.
