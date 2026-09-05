# A01:2025 Broken Access Control - BOLA / IDOR

Mission: `VF-A01-001` - Access Another User's Order

Target: `GET /api/lab/orders/:id`

This lab uses the real synthetic commerce data. User `user1@vulnforge.local` owns order `1001`; user `user2@vulnforge.local` owns order `1002`. The normal application endpoints under `/api/orders` remain ownership-scoped.

The vulnerable lab endpoint requires authentication, then loads an order by the supplied numeric ID only. It deliberately omits the object-level authorization check that would verify `orders.user_id` matches the authenticated user.

Expected behavior:

- Unauthenticated request: `401`
- Authenticated request for own order: `200`, no exploit event
- Authenticated request for another user's order: `200`, records `LAB_BOLA_EXPLOITED`
- Authenticated request for unknown order: `404`
- Malformed order ID: `422`

The exploit event is recorded only for authenticated cross-user access to an existing order. Its database/terminal metadata includes safe values: `userId`, `orderId`, `ownerId`, `requestId`, timestamp, and the mission ID when an A01 attempt is active.

Reset through `npm run db:reset` or `POST /api/admin/lab/reset` clears mission attempts and lab events, restores synthetic users/orders, and makes the exercise repeatable.
