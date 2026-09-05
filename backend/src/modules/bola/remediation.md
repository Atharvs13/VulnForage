# Remediation

## Root Cause

The backend returns an object based only on the supplied identifier and fails to verify ownership.

## Impact

An authenticated user can access another synthetic user's order data by changing the order ID.

## Secure Design

1. Authenticate the request.
2. Identify the current user from the server-side session.
3. Load the requested object.
4. Verify ownership or an explicit support/admin authorization policy.
5. Allow or deny the request.

For a normal user order endpoint, the safe query shape is:

```sql
SELECT *
FROM orders
WHERE id = ?
  AND user_id = ?
```

Support or admin access should be handled by an explicit role policy, not by silently bypassing object authorization in user-facing routes.

## Retest

Repeat the same modified-ID request after applying the ownership check. A normal user requesting another user's order should receive `404` or `403`, and no `LAB_BOLA_EXPLOITED` event should be recorded outside the intentionally vulnerable lab endpoint.
