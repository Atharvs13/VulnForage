# VulnForge API Specification

This document describes the planned REST API. Exact request/response shapes should be kept in sync with the implemented frontend and backend.

## Base URL

```text
http://localhost:4000
```

## Response Convention

Recommended success shape:

```json
{
  "success": true,
  "data": {}
}
```

Recommended error shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

## Health

### `GET /health`

Returns backend status and database connectivity.

---

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Example register request:

```json
{
  "email": "learner@example.local",
  "password": "LabPassword123!"
}
```

Use synthetic accounts only.

---

## Users

```text
GET   /api/users/me
PATCH /api/users/me
GET   /api/users/:id
```

The `/api/lab/*` namespace contains deliberately weak scenarios; core endpoints should remain understandable and maintainable.

---

## Products

```text
GET /api/products
GET /api/products/:id
```

Query examples:

```text
/api/products?q=laptop
/api/products?category=networking
```

---

## Orders

```text
GET   /api/orders
GET   /api/orders/:id
POST  /api/orders
PATCH /api/orders/:id
```

Order data should use synthetic products and customers.

---

## Support

```text
GET  /api/support/tickets
POST /api/support/tickets
GET  /api/support/tickets/:id
PATCH /api/support/tickets/:id
```

This area can also provide XSS/authorization training scenarios through dedicated lab endpoints.

---

## Uploads

```text
POST /api/uploads
GET  /api/uploads/:id
```

Lab-specific upload weaknesses should live under `/api/lab/upload/*`.

---

## Admin

```text
GET  /api/admin
GET  /api/admin/users
GET  /api/admin/orders
GET  /api/admin/tickets
POST /api/admin/lab/reset
```

Admin routes may be intentionally discoverable or weak only where a mission explicitly requires it.

---

## Missions

```text
GET  /api/missions
GET  /api/missions/:id
POST /api/missions/:id/start
POST /api/missions/:id/attempt
GET  /api/missions/:id/status
```

Example attempt:

```json
{
  "evidence": {
    "request": "GET /api/lab/orders/1002",
    "notes": "Controlled cross-user order access"
  }
}
```

---

# Lab APIs

## BOLA

```text
GET /api/lab/orders/:id
```

Purpose: controlled broken object-level authorization exercise.

## SQL Injection

```text
GET /api/lab/products/search?q=...
```

Purpose: controlled SQL injection exercise using synthetic data.

## XSS

```text
GET  /api/lab/xss/search?q=...
POST /api/lab/xss/tickets
GET  /api/lab/xss/tickets
```

## CSRF

Use a dedicated state-changing lab action, for example:

```text
POST /api/lab/csrf/change-email
```

The weakness and required evidence must be documented in the mission.

## SSRF

```text
POST /api/lab/ssrf/fetch
```

Request:

```json
{
  "url": "http://lab-internal.local/status"
}
```

The backend must allow-list only controlled local lab destinations.

## File Upload

```text
POST /api/lab/upload
GET  /api/lab/upload/:id
```

## JWT

```text
POST /api/lab/jwt/login
GET  /api/lab/jwt/profile
```

Use lab-only signing material and synthetic users.

## Business Logic

```text
POST /api/lab/cart/apply-coupon
POST /api/lab/checkout
PATCH /api/lab/orders/:id/status
```

These endpoints can expose deliberate workflow/state weaknesses.

---

# Status Codes

Use conventional HTTP status codes where practical:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Intentional lab behavior can return application-specific errors when that is part of the exercise, but keep the API predictable.
