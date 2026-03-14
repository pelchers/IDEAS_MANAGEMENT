# Phase 1: End-to-End Flow Validation

Session: integration-hardening
Phase: 1
Date: 2026-03-08

## Prior Session Summary
All 3 prior sessions complete:
- backend-foundation: 25 API endpoints validated, 4 fixes applied
- frontend-shell: Design system (3045 lines), app shell, auth pages, dashboard
- feature-views: All 8 feature views built (kanban, ideas, whiteboard, schema, directory-tree, AI chat, settings, conflicts)

> **ACCURACY NOTE (2026-03-12):** The feature-views summary above overstates completion. While all views render, many are display-only or use hardcoded/mock data. Specifically: kanban lacks card CRUD; ideas lack CRUD; whiteboard only supports freehand draw and sticky notes (not rect/text/select/lines); schema planner is display-only with hardcoded entities; directory tree uses mock data only; settings preferences don't persist and danger zone is non-functional. See individual feature-views phase files for detailed accuracy notes.

## Objective
Validate the fully assembled app end-to-end. Test complete user journeys through the live app. Find and fix integration bugs.

## Tasks
1. Test complete user journey: signup -> signin -> create project -> navigate to project views -> use features -> signout
2. Test each project view loads correctly with API data:
   - Dashboard: projects list, create, search/filter
   - Kanban: columns, cards, drag-drop, save
   - Ideas: create, filter, search, priority
   - Whiteboard: draw shapes, save, reload
   - Schema: entities, fields, save
   - Directory Tree: create nodes, expand/collapse, save
   - AI Chat: create session, send message (or handle not-configured)
   - Settings: profile display, billing link
   - Conflicts: empty state (or real conflicts if any)

> **ACCURACY NOTE (2026-03-12):** Several of the validations above were marked as passing but the features are actually incomplete. Kanban drag-drop works but card/column CRUD does not. Ideas display and filter only, no create/edit/delete. Whiteboard only freehand draw and sticky drag work. Schema is display-only with hardcoded data. Directory tree is mock data only. Settings preferences don't persist and danger zone buttons are non-functional. Dashboard chart data is hardcoded.
3. Test navigation: sidebar links, project view tabs, back/forward
4. Test responsive: desktop and mobile layouts
5. Fix all broken flows and document fixes

## Validation
- User stories covering each journey step
- Report: `.docs/validation/integration-hardening/phase_1/user-story-report.md`

## Output
- `.adr/history/integration-hardening/phase_1_review.md`
- `.docs/validation/integration-hardening/phase_1/user-story-report.md`
- Updated primary task list
