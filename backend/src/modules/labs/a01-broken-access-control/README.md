# A01 Broken Access Control

This module contains three isolated, SQLite-backed authorization failures:

- `VF-A01-001` (EASY): direct order BOLA through a path identifier.
- `VF-A01-002` (MEDIUM): a parent path is authorized but the nested order relationship is not.
- `VF-A01-003` (HARD): a paginated role catalog and synthetic resource workflow trust an unassigned role header.

All corresponding core order APIs remain ownership-scoped. The hard lab changes only
`lab_access_resources`; it never changes core orders, roles, or host state.
