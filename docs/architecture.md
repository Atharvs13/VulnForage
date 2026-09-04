# VulnForge Architecture

## 1. System Overview

```mermaid
flowchart TB
    U["Learner / Security Tester"]

    subgraph TOOLS["Testing Tools"]
      B["Browser"]
      BURP["Burp Suite"]
      ZAP["OWASP ZAP"]
      CLI["curl / Postman"]
      RECON["Nmap / ffuf / Recon"]
    end

    subgraph FRONT["Frontend"]
      UI["React + TypeScript + Vite"]
      PAGES["Pages + Components"]
      CLIENT["API Client"]
    end

    subgraph BACK["Backend"]
      EXPRESS["Node.js + Express + TypeScript"]
      ROUTES["Routes"]
      CTRL["Controllers"]
      SERVICES["Services"]
      LAB["Intentional Vulnerability Modules"]
    end

    subgraph DATA["Local Data Layer"]
      DB[("SQLite / Local DB")]
      FILES["Local Lab Storage"]
    end

    U --> B
    U --> BURP
    U --> ZAP
    U --> CLI
    U --> RECON

    B --> UI
    UI --> PAGES
    PAGES --> CLIENT
    CLIENT --> EXPRESS
    BURP --> EXPRESS
    ZAP --> EXPRESS
    CLI --> EXPRESS
    RECON --> EXPRESS

    EXPRESS --> ROUTES
    ROUTES --> CTRL
    CTRL --> SERVICES
    SERVICES --> LAB
    SERVICES --> DB
    SERVICES --> FILES
    LAB --> DB
    LAB --> FILES
```

---

## 2. Real Request Flow

```mermaid
sequenceDiagram
    actor L as Learner
    participant B as Browser / Burp
    participant F as React Frontend
    participant A as Express API
    participant C as Controller
    participant S as Service
    participant D as Local Database

    L->>B: Perform action
    B->>F: Load UI / send request
    F->>A: HTTP request
    A->>C: Route matched
    C->>S: Execute operation
    S->>D: Query / write data
    D-->>S: Result
    S-->>C: Application result
    C-->>A: JSON response
    A-->>F: HTTP response
    F-->>B: Render result
    B-->>L: Display result
```

When using Burp Suite:

```text
Browser
   │
   ▼
Burp Suite
   │  modified HTTP request
   ▼
VulnForge API
   │
   ▼
Vulnerable Module
   │
   ▼
Local Database
```

---

## 3. Backend Request Pipeline

```mermaid
flowchart TD
    HTTP["HTTP Request"] --> ROUTE["Express Route"]
    ROUTE --> MW["Middleware"]
    MW --> CTRL["Controller"]
    CTRL --> SERVICE["Service"]
    SERVICE --> LAB{ "Lab / Core Logic" }
    LAB --> DATA[("Database")]
    DATA --> RESULT["Result"]
    RESULT --> SERVICE
    SERVICE --> CTRL
    CTRL --> RESP["HTTP Response"]
```

Middleware can provide basic request parsing, authentication/session lookup, request IDs, logging, and error handling. For lab endpoints, missing security controls are deliberate and documented rather than accidental.

---

## 4. Frontend Flow

```mermaid
flowchart LR
    USER["Learner"] --> APP["React App"]
    APP --> ROUTER["Router"]
    ROUTER --> PAGE["Page"]
    PAGE --> COMPONENT["Component"]
    COMPONENT --> API["API Client"]
    API --> BACKEND["Express API"]
```

The frontend is **not** a security boundary.

A learner can alter:

- request method
- URL
- query parameters
- headers
- cookies/tokens
- JSON body
- hidden UI state

---

## 5. Core Application Flow

```text
Register / Login
       ↓
Dashboard
       ↓
Products
       ↓
Cart / Checkout
       ↓
Orders
       ↓
Support
       ↓
Missions
```

The surrounding application provides realistic context for the vulnerable labs.

---

## 6. Vulnerability Surface

```mermaid
flowchart TD
    APP["VulnForge"] --> AUTH["Authentication"]
    APP --> AUTHZ["Authorization"]
    APP --> INPUT["Input Handling"]
    APP --> OUTPUT["Output Rendering"]
    APP --> FILES["File Handling"]
    APP --> API["API"]
    APP --> LOGIC["Business Logic"]
    APP --> CONFIG["Configuration"]

    AUTH --> JWT["JWT / Session Lab"]
    AUTHZ --> BOLA["BOLA / IDOR"]
    AUTHZ --> PRIV["Privilege Boundary"]
    INPUT --> SQLI["SQL Injection"]
    INPUT --> SSRF["SSRF"]
    OUTPUT --> XSS["XSS"]
    FILES --> UPLOAD["File Upload"]
    API --> APISEC["API Security"]
    LOGIC --> BL["Business Logic"]
    CONFIG --> MISCONFIG["Misconfiguration"]
```

---

## 7. BOLA Workflow

```text
Authenticated User A
        ↓
GET /api/lab/orders/1001
        ↓
Observe object identifier
        ↓
Change identifier
        ↓
GET /api/lab/orders/1002
        ↓
Controlled cross-user object access
        ↓
Evidence
        ↓
Mission validation
```

---

## 8. SQL Injection Workflow

```text
Learner Input
      ↓
Lab Search Endpoint
      ↓
Intentionally Unsafe Query Handling
      ↓
Local PostgreSQL/SQLite data
      ↓
Controlled Result
      ↓
Evidence
```

The vulnerable behavior should remain isolated to the SQLi lab.

---

## 9. XSS Workflow

```text
Learner Input
      ↓
Search / Ticket / Comment
      ↓
Stored or Reflected Lab Data
      ↓
Frontend Rendering
      ↓
Controlled Browser-Side Impact
```

---

## 10. SSRF Workflow

```mermaid
flowchart LR
    U["Learner"] --> E["SSRF Lab Endpoint"]
    E --> F["Controlled Fetcher"]
    F --> T["Allow-listed Local Lab Target"]
    T --> R["Synthetic Response"]
    R --> E
    E --> U
```

Never allow the lab fetcher to reach arbitrary public hosts, cloud metadata, host files, production systems, or unrelated private networks.

---

## 11. Attack Chain

```mermaid
flowchart TD
    R["Recon"] --> E["Enumeration"]
    E --> A["Attack Surface"]
    A --> AUTH["Auth / AuthZ Testing"]
    AUTH --> BOLA["BOLA / IDOR"]
    BOLA --> INPUT["Input Vulnerability"]
    INPUT --> IMPACT["Controlled Impact"]
    IMPACT --> EV["Evidence"]
    EV --> M["Mission Complete"]
    M --> D["Defense"]
    D --> RT["Retest"]
```

---

## 12. Mission Flow

```mermaid
flowchart TD
    L["Mission List"] --> S["Select Mission"]
    S --> ST["Start"]
    ST --> ATT["Attack Lab"]
    ATT --> EV["Submit Evidence"]
    EV --> V{ "Validator" }
    V -->|Pass| C["Completed"]
    V -->|Fail| F["Failed Attempt"]
    F --> ATT
    C --> DEF["Defense / Retest"]
```

---

## 13. Reset Flow

```text
RESET LAB
   ↓
Clear temporary lab records
   ↓
Restore synthetic users/data
   ↓
Restore vulnerable fixtures
   ↓
Reset mission attempts
   ↓
Clear temporary uploads
   ↓
Restore lab settings
   ↓
Health check
   ↓
READY
```

---

## 14. Trust Boundaries

```mermaid
flowchart LR
    A["Learner / Browser"] -->|Untrusted HTTP| F["Frontend"]
    F -->|Untrusted HTTP / JSON| B["Backend"]
    B -->|Controlled Access| D[("Local DB")]
    B -->|Controlled File Access| S["Lab Storage"]

    A -.->|Modified Requests| B
    A -.->|Direct API Calls| B
```

Important boundaries:

1. Browser → backend
2. User → other user
3. User → support/admin
4. Lab → host
5. Lab → network

---

## 15. Deployment Model

```mermaid
flowchart TB
    HOST["Local Machine / Private VM"]
    HOST --> DOCKER["Docker Compose (optional)"]
    DOCKER --> FRONT["Frontend"]
    DOCKER --> BACK["Backend"]
    BACK --> DB[("Local Database")]
```

Development may also run directly with Node.js and a local database without Docker.

---

## 16. Guiding Principle

> **Make the web application realistic, make the vulnerabilities deliberate, and keep the lab isolated.**
