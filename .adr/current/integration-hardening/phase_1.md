# Phase 1: End-to-End Flow Validation

Session: integration-hardening
Phase: 1
Date: 2026-03-08

## Prior Session Summary
All 3 prior sessions complete:
- backend-foundation: 25 API endpoints validated, 4 fixes applied
- frontend-shell: Design system (3045 lines), app shell, auth pages, dashboard
- feature-views: All 8 feature views built (kanban, ideas, whiteboard, schema, directory-tree, AI chat, settings, conflicts)

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
