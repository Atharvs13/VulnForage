# VulnForage

VulnForage is an intentionally vulnerable, locally deployable cybersecurity training application focused on hands-on web application security and the OWASP Top 10:2025. It provides a structured environment for security learners, developers, and educators to practice identifying and exploiting vulnerabilities in a modern technology stack.

> [!CAUTION]
> **Lab Safety Warning**
> VulnForage is intentionally vulnerable by design. It should **only** be run on `localhost` or within private, isolated, and disposable environments. 
> **Never** deploy this application to production systems, expose it to public endpoints, or use real credentials, real databases, or sensitive data within it.

---

## 🎯 Project Goals

VulnForage aims to provide a realistic, modern, and reproducible environment for learning web application security. We focus on real HTTP and application behavior, moving beyond abstract theories to practical, hands-on exploitation and remediation workflows.

## 🔄 Learning Workflow

Our recommended approach to tackling labs:

Understand ➔ Recon ➔ Inspect HTTP ➔ Identify vulnerability ➔ Exploit ➔ Collect evidence ➔ Understand root cause ➔ Apply remediation ➔ Retest ➔ Reset

## 🏛 Architecture

VulnForage uses a modern, separated frontend/backend architecture to simulate real-world web applications.

```mermaid
flowchart TD
    A[Browser / Burp Suite / OWASP ZAP / curl] -->|HTTP/REST| B[React + TypeScript + Vite :5173]
    B -->|API Requests| C[Express + TypeScript :4000]
    C --> D[Core API & Support]
    C --> E[Mission Engine]
    C --> F[/api/lab/* Vulnerability Modules]
    D --> G[(SQLite Database)]
    E --> G
    F --> G
```

## 🛠 Technology Stack

*   **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Port: `5173`)
*   **Backend**: Node.js + Express 5 + TypeScript (Port: `4000`)
*   **Database**: SQLite using native `node:sqlite`
*   **Security Testing Tools**: Bring your own (Burp Suite, OWASP ZAP, curl, Browser DevTools)
*   **Vulnerability Modules**: Isolated within dedicated `/api/lab/*` routes.

## 🛡 OWASP Top 10:2025

VulnForage is structured around the OWASP Top 10:2025 framework. 

*   A01 Broken Access Control
*   A02 Security Misconfiguration
*   A03 Software Supply Chain Failures
*   A04 Cryptographic Failures
*   A05 Injection
*   A06 Insecure Design
*   A07 Authentication Failures
*   A08 Software or Data Integrity Failures
*   A09 Logging & Alerting Failures
*   A10 Mishandling of Exceptional Conditions

> [!NOTE]
> Please note that not all categories are fully implemented yet. See the **Current Lab Focus** and **Roadmap** sections for details on currently available missions.

## 🔬 Current Lab Focus

**Current Priority: A01:2025 — Broken Access Control (BOLA / IDOR)**

*   **Mission**: `VF-A01-001`
*   **Target**: `GET /api/lab/orders/:id`

**Scenario**: 
The application manages e-commerce orders. The standard `/api/orders` endpoints properly enforce access controls. However, the intentional lab endpoint `/api/lab/orders/:id` omits these checks. Your goal is to access an order belonging to another user.

*   `user1@vulnforge.local` owns order ID `1001`
*   `user2@vulnforge.local` owns order ID `1002`

By authenticating as one user and modifying the `id` parameter to target the other user's order, you can exploit this Broken Object Level Authorization (BOLA) vulnerability.

## 🎯 Mission System

VulnForage utilizes a server-side mission validation and event workflow. When an exploit is successfully executed against a lab endpoint (e.g., cross-user data access in the BOLA lab), the backend detects the anomaly and registers a mission event (such as `LAB_BOLA_EXPLOITED`). This provides deterministic, server-side proof of exploitation.

## 👥 Synthetic Data & Accounts

**All identities, credentials, and data within VulnForage are entirely synthetic.** 
There are no real users, and no production secrets or credentials should ever be used or exposed within this project. The database contains seeded test accounts (e.g., `user1@vulnforge.local`, `support@vulnforge.local`, `admin@vulnforge.local`) designed specifically for the lab scenarios.

---

## 🚀 Quick Start

Ensure you have Node.js (>=22.5) installed.

### Option 1: Combined Start (Recommended)

From the repository root, you can install dependencies and run both servers concurrently:

```bash
npm install -w backend
npm install -w frontend
npm install
npm run dev
```

### Option 2: Separate Terminals

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access Points

*   **Frontend**: http://localhost:5173
*   **Backend**: http://localhost:4000
*   **Backend Health Check**: http://localhost:4000/health

## 🗄️ Database & Reset

To reset the database to its initial clean state with all synthetic data seeded, run the following command from the repository root:

```bash
npm run db:reset
```
This is crucial for ensuring reproducible labs and clearing out any state changes made during exploitation.

## 💻 Development Commands

The root `package.json` provides the following unified commands:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both backend and frontend concurrently in development mode |
| `npm run build` | Builds both backend and frontend projects |
| `npm run test` | Runs tests for both backend and frontend |
| `npm run lint` | Lints both backend and frontend code |
| `npm run db:reset` | Resets the backend database to a clean state |
| `npm run health` | Checks the health of the backend server |

## 📁 Project Structure

```text
VulnForage/
├── backend/            # Express 5 backend & Core API
├── frontend/           # React 19 frontend
├── data/               # SQLite database storage directory
├── docs/               # Project documentation
├── scripts/            # Utility and helper scripts
├── docker-compose.yml  # Docker container configuration
└── package.json        # Root workspace configuration
```

## 🐳 Docker

VulnForage can be run using Docker Compose for complete isolation.

```bash
docker compose up --build
```

This will build and start the backend and frontend services, binding them to `127.0.0.1` and persisting the SQLite database in a local Docker volume.

---

## 🤝 Contributing

We welcome contributions! Please follow this workflow to contribute:

Issue ➔ Fork / Branch ➔ Changes ➔ Tests ➔ Pull Request ➔ Review ➔ Merge

*   Keep Pull Requests focused on a single issue or feature.
*   Always reference the relevant GitHub Issue in your PR.
*   Use GitHub Issues and Pull Requests for all support and collaboration.

### Development Principles

When contributing to VulnForage, please adhere to these core principles:
*   **One lab at a time**: Keep vulnerabilities isolated.
*   **Real HTTP/application behavior**: Simulate real-world patterns over contrived CTF puzzles.
*   **Synthetic data only**: Never commit real secrets.
*   **Explicit `/api/lab/*` vulnerability boundaries**: Keep the core application secure; only the lab routes should be vulnerable.
*   **Reproducible/resettable labs**: Ensure `npm run db:reset` cleanly restores state.
*   **Server-side mission validation**: Rely on the backend to detect and confirm successful exploits.

## 🗺️ Roadmap

Our current development focus includes:
*   Polish the A01 BOLA lab scenario.
*   Improve the evidence collection workflow.
*   Enhance the defense and remediation guidance.
*   Improve lab reset functionality and reproducibility.
*   Add automated test coverage.
*   Incrementally build and release additional OWASP 2025 labs.

## 🎓 Who is this for?

VulnForage is built for a wide range of individuals passionate about security:
*   Cybersecurity students
*   Security learners
*   Penetration-testing learners
*   CTF players
*   Developers looking to understand secure coding
*   Security educators
*   Application security learners
