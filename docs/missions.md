# VulnForge Missions — OWASP Top 10:2025 Curriculum

Missions describe what to investigate without immediately revealing a payload. Status is tracked per user: `available`, `in_progress`, `failed`, or `completed`. Starting creates an attempt; each submission increments its count. Completion requires evidence plus a matching server-recorded lab event after mission start. Completion unlocks root cause, remediation, and retest guidance.

| ID | Title | OWASP Top 10:2025 Category | Difficulty | Target Endpoint | Objective / Expected Evidence |
|---|---|---|---|---|---|
| **VF-A01-001** | Access Another User's Order | A01:2025 Broken Access Control (BOLA/IDOR) | Medium | `GET /api/lab/orders/:id` | Submit an HTTP request and response proving authenticated cross-user order access |
| **VF-002** | Find the SQL injection point | A05 Injection (SQLi) | Medium | `GET /api/lab/products/search?q=` | Show altered query behavior/hidden synthetic row |
| **VF-003** | Stored XSS in support | A05 Injection (XSS) | Medium | `POST/GET /api/lab/xss/tickets` | Stored payload and unsafe lab preview context |
| **VF-004** | Controlled internal fetch | A05 Injection (SSRF) | Hard | `POST /api/lab/ssrf/fetch` | Synthetic internal-service response |
| **VF-005** | Cross-site state change | A01 Broken Access Control (CSRF) | Medium | `POST /api/lab/csrf/change-email` | Email change without anti-CSRF token |
| **VF-006** | Upload validation bypass | A08 Software/Data Integrity Failures | Medium | `POST /api/lab/upload` | Accepted misleading double extension |
| **VF-007** | Tamper with a lab token | A04 Cryptographic Failures (JWT) | Hard | `GET /api/lab/jwt/profile` | Synthetic admin flag from tampered lab token |
| **VF-008** | Manipulate checkout pricing | A06 Insecure Design (Business Logic) | Medium | `POST /api/lab/checkout` | Receipt below authoritative catalog price |
| **VF-009** | Discover exposed configuration | A02 Security Misconfiguration | Easy | `GET /api/lab/debug/config` | Synthetic debug flag/config response |
| **VF-010** | Login SQL Injection | A05 Injection (Auth SQLi) | Medium | `POST /api/lab/sqli/login` | Bypass authentication using SQL injection |
| **VF-011** | Supply chain metadata exposure | A03 Software Supply Chain Failures | Medium | `GET /api/lab/supply-chain/manifest` | Discover unverified component dependency details |
| **VF-012** | Log injection & unmonitored security | A09 Logging & Alerting Failures | Medium | `POST /api/lab/logging/event` | Forge audit entry using CRLF log injection |
| **VF-013** | Fail-open exception handling | A10 Mishandling of Exceptional Conditions | Hard | `POST /api/lab/exceptions/process` | Trigger null pointer to grant elevated access |
| **VF-014** | Unrestricted brute force | A07 Authentication Failures | Medium | `POST /api/lab/auth/bruteforce` | Rapid password enumeration without lockout |
| **VF-015** | Weak hash & key exposure | A04 Cryptographic Failures (MD5) | Easy | `POST /api/lab/crypto/hash` | Reverse plain-text secret from MD5 output |

---

## Root Causes and Defenses

- **VF-A01-001:** The backend returns an object based only on the supplied identifier and fails to verify ownership. Use server-side object-level authorization and retest modified IDs.
- **VF-002:** Query string concatenation; bind parameters and confirm payloads become literal data.
- **VF-003:** Unsafe HTML rendering; encode/sanitize contextually and confirm markup is inert.
- **VF-004:** Caller-selected server destination; strict parsing/allow-list/egress controls and redirect/DNS revalidation.
- **VF-005:** Cookie action lacks request-integrity proof; require session-bound tokens and origin validation.
- **VF-006:** Incomplete filename/MIME trust; canonicalize, inspect content, randomize storage, and authorize retrieval.
- **VF-007:** Algorithm/claim trust; pin algorithm, verify signature/issuer/audience/expiry, and authorize from server state.
- **VF-008:** Caller owns price; derive price/discount/workflow transitions from authoritative server data.
- **VF-009:** Debug endpoint exposed; disable outside isolated development and require proper authorization.
- **VF-010:** Unsafe query concatenation in authentication logic; use parameterized queries and avoid string concatenation.
- **VF-011:** Untrusted package dependencies; maintain SBOM, pin exact lockfiles, and run automated CVE scanning.
- **VF-012:** Unsanitized log output; strip/escape CRLF characters (%0A/%0D) before writing to security streams.
- **VF-013:** Exception handler fail-open; default to access denied in catch blocks and reject malformed inputs.
- **VF-014:** Lack of rate limits; enforce IP/account attempt caps, exponential backoffs, and account lockouts.
- **VF-015:** Weak MD5 algorithm; migrate to salted key derivation algorithms like Argon2id or bcrypt.

Attack mode shows objective, target, difficulty, and allowed local scope. Guided mode reveals progressive hints. Defense mode unlocks upon evidence submission.
