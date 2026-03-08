# Phase 3 Validation: Project CRUD + Members

Session: backend-foundation
Phase: 3
Date: 2026-03-08

---

## Test Results

| User Story | Description | Result | Notes |
|-----------|-------------|--------|-------|
| US-1 | Project creation returns 201 with project data + user as OWNER | PASS | Name, desc, tags, slug auto-generated, creator is OWNER, 7 artifacts bootstrapped |
| US-2 | Project list returns user's projects with correct count | PASS | Admin sees all (2), member sees only their projects (0 before add, 1 after) |
| US-3 | Project search/sort/filter works | PASS | search=Alpha (1 result), sort=name asc/desc correct, status=ACTIVE filter correct, tag=updated filter correct |
| US-4 | Project update modifies fields correctly | PASS | Full update (name+desc+tags), partial update (status only), empty update rejected (no_changes) |
| US-5 | Project delete removes project (soft-delete/archive) | PASS | Status set to ARCHIVED, project still accessible |
| US-6 | Member add/remove/role-change works | PASS | Add member (201), role change VIEWER->EDITOR (PATCH), remove member (DELETE), last-owner protection on both remove and demote |
| US-7 | Permission checks prevent unauthorized actions | PASS | VIEWER cannot update/delete/manage members, EDITOR can update but not delete, non-member gets 404, unauthenticated gets 401 |

**Total: 7/7 PASS**

---

## Detailed Test Log

### US-1: Project Creation
- POST /api/projects with name+desc+tags -> 201 with project data
- Creator automatically added as OWNER member
- Slug generated: "test-project-979f6l" from "Test Project"
- 7 default artifacts bootstrapped (project.json, kanban, whiteboard, schema, directory-tree, ideas, ai chat)
- Missing name -> 400 name_required
- Empty name -> 400 name_required
- Status defaults to PLANNING, can be set explicitly (ACTIVE)

### US-2: Project List
- GET /api/projects returns all projects for authenticated user
- Admin sees all projects (role-based bypass)
- Non-member user sees 0 projects
- After adding as member, user sees the project
- Response includes memberCount and userRole

### US-3: Search/Sort/Filter
- search=Alpha -> returns only Alpha Project
- sort=name&order=asc -> Alpha before Test
- sort=name&order=desc -> Test before Alpha
- status=ACTIVE -> returns only Alpha Project
- tag=updated -> returns only Updated Project

### US-4: Project Update
- PATCH /api/projects/[id] with name+desc+tags -> updates all fields
- Partial update (status only) -> updates status, preserves other fields
- Empty body {} -> 400 no_changes
- EDITOR role can update (after role change from VIEWER)
- VIEWER role cannot update -> 403 forbidden

### US-5: Project Delete
- DELETE /api/projects/[id] -> soft-deletes (sets status to ARCHIVED)
- Project still accessible after archive (status = ARCHIVED)
- Only OWNER can delete -> non-owner gets 403

### US-6: Member Management
- POST /api/projects/[id]/members -> adds member with specified role (201)
- Duplicate add -> 409 already_member
- PATCH /api/projects/[id]/members/[memberId] -> changes role (new endpoint added)
- DELETE /api/projects/[id]/members/[memberId] -> removes member
- Cannot remove last OWNER -> 400 cannot_remove_last_owner
- Cannot demote last OWNER -> 400 cannot_demote_last_owner
- Invalid role -> 400 invalid_role
- Non-existent member -> 404 member_not_found

### US-7: Permission Checks
- Unauthenticated -> 401 unauthorized (proxy middleware)
- Non-member -> 404 not_found (security: doesn't leak existence)
- VIEWER -> can read, cannot update/delete/manage members
- EDITOR -> can read+update, cannot delete/manage members
- OWNER -> full access
- ADMIN -> bypasses membership checks

---

## Bugs Found and Fixed

### BUG-1: Missing PATCH endpoint for member role changes
- **File**: `apps/web/src/app/api/projects/[id]/members/[memberId]/route.ts`
- **Issue**: Only DELETE handler existed. No endpoint to change a member's role.
- **Fix**: Added PATCH handler with role validation, last-owner-demote protection, and audit logging.
- **Severity**: Medium (feature gap, not a crash)
