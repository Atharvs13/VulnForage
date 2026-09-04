# VulnForge Missions

Missions describe what to investigate without immediately revealing a payload. Status is per user: `available`, `in_progress`, `failed`, or `completed`. Starting creates an attempt; each submission increments its count. Completion requires substantive evidence plus a matching server-recorded lab event after start. Completion unlocks root cause, remediation, and retest guidance.

| ID | Title | Category | Difficulty | Target | Objective / expected evidence |
|---|---|---|---|---|---|
| VF-001 | Access another user's order | BOLA/IDOR | Easy | `GET /api/lab/orders/:id` | Show controlled cross-user order access |
| VF-002 | Find the SQL injection point | SQLi | Medium | `GET /api/lab/products/search?q=` | Show altered query behavior/hidden synthetic row |
| VF-003 | Stored XSS in support | XSS | Medium | `POST/GET /api/lab/xss/tickets` | Stored payload and unsafe lab preview context |
| VF-004 | Controlled internal fetch | SSRF | Hard | `POST /api/lab/ssrf/fetch` | Synthetic internal-service response |
| VF-005 | Cross-site state change | CSRF | Medium | `POST /api/lab/csrf/change-email` | Email change without anti-CSRF token |
| VF-006 | Upload validation bypass | File Upload | Medium | `POST /api/lab/upload` | Accepted misleading double extension |
| VF-007 | Tamper with a lab token | JWT | Hard | `GET /api/lab/jwt/profile` | Synthetic admin flag from tampered lab token |
| VF-008 | Manipulate checkout pricing | Business Logic | Medium | `POST /api/lab/checkout` | Receipt below authoritative catalog price |
| VF-009 | Discover exposed configuration | Misconfiguration | Easy | `GET /api/lab/debug/config` | Synthetic debug flag/config response |
| VF-010 | Login SQL Injection | SQLi | Medium | `POST /api/lab/sqli/login` | Bypass authentication using SQL injection |

## Root causes and defenses

- **VF-001:** missing object ownership scope; authorize every object server-side and retest modified IDs.
- **VF-002:** query string concatenation; bind parameters and confirm payloads become literal data.
- **VF-003:** unsafe HTML rendering; encode/sanitize contextually and confirm markup is inert.
- **VF-004:** caller-selected server destination; strict parsing/allow-list/egress controls and redirect/DNS revalidation.
- **VF-005:** cookie action lacks request-integrity proof; require session-bound tokens and origin validation.
- **VF-006:** incomplete filename/MIME trust; canonicalize, inspect content, randomize storage, and authorize retrieval.
- **VF-007:** algorithm/claim trust; pin algorithm, verify signature/issuer/audience/expiry, and authorize from server state.
- **VF-008:** caller owns price; derive price/discount/workflow transitions from authoritative server data.
- **VF-009:** debug endpoint exposed; disable outside isolated development and require proper authorization.
- **VF-010:** unsafe query concatenation in authentication logic; use parameterized queries and avoid string concatenation.

Attack mode shows objective, target, difficulty, and allowed local scope. Guided mode reveals two progressive hints. Defense mode remains unavailable until validation. Evidence should include endpoint/method, changed input, interesting response, and a concise controlled-impact explanation—never real-world targets or secrets.
