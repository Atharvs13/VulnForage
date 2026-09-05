# VulnForge — Cybersecurity Training Lab (OWASP Top 10:2025)

VulnForge is a locally deployable, intentionally vulnerable e-commerce and support web application built for hands-on application security training and penetration testing. Learners perform reconnaissance, inspect and modify HTTP requests, exploit controlled vulnerability modules, submit evidence, analyze root causes, study secure remediations, retest, and deterministically reset the range.

> [!CAUTION]
> **Lab Isolation Notice**: VulnForge is designed solely for local/private educational testing. Always run VulnForge on `localhost` or in an isolated, disposable VM environment. Never connect it to production networks, real credentials, public endpoints, or sensitive systems.

---

## 🏛 Architecture & Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Port `5173`)
- **Backend**: Node.js + Express 5 + TypeScript + Native SQLite (`node:sqlite`) (Port `4000`)
- **Database**: Zero-dependency local SQLite database (`vulnforge.db`) with foreign key enforcement and WAL mode
- **Vulnerability Isolation**: Dedicated lab endpoints isolated under `/api/lab/*` operating strictly on synthetic tables

```text
Browser / Burp Suite / OWASP ZAP / curl
          │ untrusted HTTP
          ▼
React + TypeScript + Vite (5173)
          │ JSON / Multipart
          ▼
Express + TypeScript (4000)
   ├── Core E-Commerce & Support API
   ├── Mission Attempt & Event Validator
   └── Explicit /api/lab/* Modules (OWASP Top 10:2025)
          ▼
SQLite Database + Local Lab File Storage
```

---

## 🛡 OWASP Top 10:2025 Curriculum & Missions

VulnForge features 15 dedicated missions mapping directly to the **OWASP Top 10:2025** standards:

| Category | OWASP Top 10:2025 Title | Mission ID | Mission Title | Target Endpoint |
|---|---|---|---|---|
| **A01:2025** | Broken Access Control | `VF-A01-001` | Access Another User's Order (BOLA/IDOR) | `GET /api/lab/orders/:id` |
| **A01:2025** | Broken Access Control | `VF-005` | Cross-site state change (CSRF) | `POST /api/lab/csrf/change-email` |
| **A02:2025** | Security Misconfiguration | `VF-009` | Discover exposed configuration | `GET /api/lab/debug/config` |
| **A03:2025** | Software Supply Chain Failures | `VF-011` | Supply chain metadata exposure | `GET /api/lab/supply-chain/manifest` |
| **A04:2025** | Cryptographic Failures | `VF-007` | Tamper with a lab token (JWT `alg: none`) | `GET /api/lab/jwt/profile` |
| **A04:2025** | Cryptographic Failures | `VF-015` | Weak hash & key exposure (MD5) | `POST /api/lab/crypto/hash` |
| **A05:2025** | Injection | `VF-002` | Catalog search SQL injection | `GET /api/lab/products/search?q=` |
| **A05:2025** | Injection | `VF-003` | Stored XSS in support preview | `POST/GET /api/lab/xss/tickets` |
| **A05:2025** | Injection | `VF-004` | Controlled internal fetch (SSRF) | `POST /api/lab/ssrf/fetch` |
| **A05:2025** | Injection | `VF-010` | Login SQL injection bypass | `POST /api/lab/sqli/login` |
| **A06:2025** | Insecure Design | `VF-008` | Manipulate checkout pricing logic | `POST /api/lab/checkout` |
| **A07:2025** | Authentication Failures | `VF-014` | Unrestricted brute force | `POST /api/lab/auth/bruteforce` |
| **A08:2025** | Software & Data Integrity Failures | `VF-006` | Upload validation bypass (Double Extension) | `POST /api/lab/upload` |
| **A09:2025** | Logging & Alerting Failures | `VF-012` | Log injection & unmonitored security | `POST /api/lab/logging/event` |
| **A10:2025** | Mishandling of Exceptional Conditions | `VF-013` | Fail-open exception handling bypass | `POST /api/lab/exceptions/process` |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 22.5+ (Node 24 recommended)
- npm 10+

### Setup & Launch

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional overrides)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Seed database baseline
npm run db:reset

# 4. Start frontend and backend in dev mode
npm run dev
```

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 🔑 Synthetic Credentials

All identities and data in VulnForge are completely synthetic:

| Role | Email | Password | Purpose |
|---|---|---|---|
| User | `user1@vulnforge.local` | `User1Lab!` | Standard synthetic account |
| User | `user2@vulnforge.local` | `User2Lab!` | Target account for BOLA exercises |
| Support | `support@vulnforge.local` | `SupportLab!` | Support ticket management |
| Admin | `admin@vulnforge.local` | `AdminLab!` | Administrator panel & lab reset |
| Legacy Admin | `legacy-admin@vulnforge.local` | `SuperSecretLabPassword123!` | SQLi & brute-force target account |

For the A01 BOLA lab, `user1@vulnforge.local` owns order `1001` and `user2@vulnforge.local` owns order `1002`. The normal `/api/orders` endpoints enforce ownership; the intentional lab target `GET /api/lab/orders/:id` omits that check for authenticated learners and records `LAB_BOLA_EXPLOITED` on cross-user access.

---

## 🛠 Commands & Verification

```bash
npm run dev          # Run frontend and backend concurrently
npm run build        # Compile production TypeScript builds for backend and frontend
npm test             # Execute backend HTTP integration & frontend Vitest suite
npm run lint         # Execute strict TypeScript typechecking
npm run db:reset     # Deterministically reset database to clean synthetic baseline
npm run health       # Query health check on running backend server
```

---

## 🐳 Docker Deployment

To launch VulnForge in isolated containers:

```bash
docker compose up --build
```

Compose binds services exclusively to `127.0.0.1`. SQLite state is stored in a private Docker volume (`vulnforge-data`).

---

## 🔄 Controlled Database Impact & Reset

The database reset script (`npm run db:reset` or `POST /api/admin/lab/reset`) returns VulnForge to a known, clean baseline by resetting synthetic users, products, orders, tickets, lab settings, and fixtures while wiping attempts, sessions, uploads, and logs. Database schemas and migrations remain completely intact.
