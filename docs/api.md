# VulnForge API

Base URL: `http://localhost:4000`. Successes use `{ "success": true, "data": ... }`; failures use `{ "success": false, "error": { "code", "message", "requestId" } }`. Authentication is an HTTP-only `vf_session` cookie.

## Health, authentication, and users

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/health` | No | Backend, SQLite, config, and lab-mode status |
| POST | `/api/auth/register` | No | `{email,password,displayName}` → `201 {user}` and cookie |
| POST | `/api/auth/login` | No | `{email,password}` → `{user}` and cookie |
| POST | `/api/auth/logout` | Yes | Deletes current session |
| GET | `/api/auth/me` | Yes | Current `{user}` |
| GET | `/api/users/me` | Yes | Current profile |
| PATCH | `/api/users/me` | Yes | `{displayName,bio,shippingAddress}` |
| GET | `/api/users/:id` | Yes | Public profile projection |

## Core application

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/api/products` | No | Optional `q`, `category`; returns `{products}` |
| GET | `/api/products/:id` | No | `{product}` |
| GET | `/api/orders` | Yes | Own orders; elevated roles see all |
| GET | `/api/orders/:id` | Yes | Ownership-scoped core order |
| POST | `/api/orders` | Yes | `{items:[{productId,quantity}],shippingAddress}` |
| PATCH | `/api/orders/:id` | Yes | User cancellation/elevated status management |
| GET/POST | `/api/support/tickets` | Yes | List or create `{subject,message}` |
| GET/PATCH | `/api/support/tickets/:id` | Yes | Owned ticket or `{status}` update |
| POST | `/api/uploads` | Yes | Multipart `file`; safe type/size storage |
| GET | `/api/uploads/:id` | Owner | Download owned core upload |

Order example: `{"items":[{"productId":1,"quantity":1}],"shippingAddress":"100 Training Circuit, Lab City"}`. The server owns price and stock calculations.

## Missions

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/api/missions` | Yes | Missions plus caller status |
| GET | `/api/missions/:id` | Yes | Mission/attempt; defense only after completion |
| POST | `/api/missions/:id/start` | Yes | Start/restart attempt |
| POST | `/api/missions/:id/attempt` | Yes | `{evidence:{...}}`; validates a matching event since start |
| GET | `/api/missions/:id/status` | Yes | Current mission state |

## Admin

`GET /api/admin`, `/users`, `/orders`, `/tickets`, and `/logs`, plus `POST /api/admin/lab/reset`, all require `admin`. Reset restores the baseline and invalidates sessions.

## Intentionally vulnerable lab APIs

All require a normal session and `LAB_MODE=true`.

| Lab | Method/path | Deliberate behavior |
|---|---|---|
| BOLA | GET `/api/lab/orders/:id` | No owner scope |
| SQLi | GET `/api/lab/products/search?q=` | Concatenation into dedicated `lab_products` query |
| XSS | GET `/api/lab/xss/search?q=` | Reflected unsafe-lab value |
| XSS | POST/GET `/api/lab/xss/tickets` | Stored unsafe-lab messages |
| CSRF | POST `/api/lab/csrf/change-email` | `{email}` without anti-CSRF token |
| SSRF | POST `/api/lab/ssrf/fetch` | `{url}` exact synthetic allow-list only |
| Upload | POST `/api/lab/upload` | Weak `.txt` substring filename check |
| Upload | GET `/api/lab/upload/:id` | Force-served as non-executable `text/plain` |
| JWT | POST `/api/lab/jwt/login` | Returns lab-only token |
| JWT | GET `/api/lab/jwt/profile` | Bearer token; accepts `alg:none` deliberately |
| Logic | POST `/api/lab/cart/apply-coupon` | Synthetic coupon calculation |
| Logic | POST `/api/lab/checkout` | Trusts `unitPriceCents` |
| Logic | PATCH `/api/lab/orders/:id/status` | Synthetic state only |
| Misconfig | GET `/api/lab/debug/config` | Synthetic debug metadata |

The SSRF allow-list contains only `http://lab-internal.local/status`; the service returns an in-process synthetic response and performs no arbitrary network fetch.

Conventional status codes are used: `200`, `201`, `204`, `401`, `403`, `404`, `409`, `422`, and sanitized `500`.
