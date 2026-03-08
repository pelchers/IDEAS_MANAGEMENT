# Phase 3 Review: Project CRUD + Members

Session: backend-foundation
Phase: 3
Date: 2026-03-08
Status: COMPLETE

---

## Technical Summary

Phase 3 validated all project CRUD and member management endpoints against the live dev server (localhost:3000). All 7 user stories passed. One missing endpoint was identified and implemented (member role change via PATCH).

### Endpoints Tested

1. **POST /api/projects** - Create project with name/desc/tags/status, auto-generates slug, bootstraps 7 default artifacts, creator becomes OWNER
2. **GET /api/projects** - List projects with search, sort (name/created/updated), order (asc/desc), status filter, tag filter. Non-admin users see only their projects.
3. **GET /api/projects/[id]** - Get project details with members, artifacts, and user's role. Non-members get 404.
4. **PATCH /api/projects/[id]** - Update project metadata. Requires EDITOR or OWNER role. Supports partial updates.
5. **DELETE /api/projects/[id]** - Soft-delete (archive) project. Requires OWNER role.
6. **POST /api/projects/[id]/members** - Add member with role. Requires OWNER. Rejects duplicates (409).
7. **PATCH /api/projects/[id]/members/[memberId]** - Change member role. Requires OWNER. Protects last owner. **(NEW - added this phase)**
8. **DELETE /api/projects/[id]/members/[memberId]** - Remove member. Requires OWNER. Protects last owner.

### Security Features Verified

- Session cookie (im_session) validated via SHA-256 hash comparison against DB
- Proxy middleware blocks unauthenticated API requests with 401
- Non-member access returns 404 (not 403) to avoid leaking project existence
- Role hierarchy enforced: OWNER > EDITOR > VIEWER
- ADMIN role bypasses membership checks
- Last-owner protection on both removal and demotion
- Audit logging for all mutating operations

### Issues Found and Fixed

1. **Missing PATCH endpoint for member role changes** - The `[memberId]/route.ts` only had a DELETE handler. Added a PATCH handler with full validation, role hierarchy checks, last-owner-demote protection, and audit logging.

### Investigation: 401 on Project Creation

The user reported 401 errors when creating projects. Root cause: the `!` character in the password `AdminPass123!` was being escaped by the shell (bash on Windows) to `\!` even inside single quotes, causing Zod validation to fail with `invalid_request` (password contained a backslash, making it a different string). This is a client-side shell escaping issue, not a server bug. The fix is to use heredoc-quoted files for curl payloads containing special characters.

---

## File Tree of Changes

```
apps/web/src/app/api/projects/[id]/members/[memberId]/
  route.ts                        (modified) Added PATCH handler for role changes

.docs/validation/backend-foundation/phase_3/
  user-story-report.md            (new) Validation report with US-1 through US-7

.adr/history/backend-foundation/
  phase_3_review.md               (new) This review document

.adr/orchestration/backend-foundation/
  primary_task_list.md            (modified) Phase 3 items checked off
```

---

## Test Results

| User Story | Description | Result |
|-----------|-------------|--------|
| US-1 | Project creation returns 201 with project data + user as OWNER | PASS |
| US-2 | Project list returns user's projects with correct count | PASS |
| US-3 | Project search/sort/filter works | PASS |
| US-4 | Project update modifies fields correctly | PASS |
| US-5 | Project delete removes project (soft-delete/archive) | PASS |
| US-6 | Member add/remove/role-change works | PASS |
| US-7 | Permission checks prevent unauthorized actions | PASS |

**Total: 7/7 PASS**

---

## Database State After Testing

- Test project created: "Updated Project" (ACTIVE status, slug: test-project-979f6l)
- Alpha Project created and archived (soft-deleted)
- Second user created: member@test.com (USER role) for permission testing
- Member added/role-changed/removed during testing
- Audit log entries for all project and member operations
