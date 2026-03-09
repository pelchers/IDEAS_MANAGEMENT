# Phase 3: Project CRUD + Members

Session: backend-foundation
Phase: 3
Date: 2026-03-07

## Prior Phase Summary
Phase 2 completed: All 8 auth endpoints tested and working. 11/11 user stories pass. No bugs found. Admin account works (admin@ideamgmt.local / AdminPass123!). Commit: 3fd0540.

## Objective
Test and fix all project CRUD and member management endpoints against the live dev server.

## Tasks
1. Test project creation (POST /api/projects):
   - Create with name + description + tags
   - Verify creator becomes OWNER member automatically
   - Verify slug generation
   - Test missing name rejection
2. Test project list (GET /api/projects):
   - List all projects for authenticated user
   - Test search parameter
   - Test sort parameter (name, created, updated)
   - Test order parameter (asc, desc)
   - Test status filter parameter
3. Test project get by ID (GET /api/projects/[id]):
   - Get existing project
   - Get non-existent project -> 404
   - Get project user is not a member of -> 403 or 404
4. Test project update (PUT /api/projects/[id]):
   - Update name, description, status, tags
   - Test partial updates
   - Test non-owner update permissions
5. Test project delete (DELETE /api/projects/[id]):
   - Owner can delete
   - Non-owner cannot delete
   - Cascade deletes members and artifacts
6. Test member management:
   - POST /api/projects/[id]/members - add member
   - PUT /api/projects/[id]/members/[memberId] - change role
   - DELETE /api/projects/[id]/members/[memberId] - remove member
   - Test permission checks (only OWNER can manage members)
7. Fix any broken endpoints

## Validation
- User stories:
  - US-1: Project creation returns 201 with project data + user as OWNER
  - US-2: Project list returns user's projects with correct count
  - US-3: Project search/sort/filter works
  - US-4: Project update modifies fields correctly
  - US-5: Project delete removes project and cascades
  - US-6: Member add/remove/role-change works
  - US-7: Permission checks prevent unauthorized actions
- Report: `.docs/validation/backend-foundation/phase_3/user-story-report.md`

## Output
- `.adr/history/backend-foundation/phase_3_review.md`
- `.docs/validation/backend-foundation/phase_3/user-story-report.md`
- Updated primary task list (Phase 3 checked off)
