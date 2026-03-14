# Agent Ingest — Session 10a: Accuracy Audit & Remediation Plan

**Date:** 2026-03-12
**Trigger:** User-reported broken functionality across multiple views
**Action:** Full audit of claimed vs actual app state

---

## Key Findings

Sessions 1-9 were marked complete in orchestration task lists and TODO.md, but audit revealed:
- **4 sessions falsely marked complete** (Workspace, Schema, Ideas, Directory Tree)
- **5 sessions partially true** (Dashboard, Kanban, Whiteboard, Settings, Auth forms)
- **4 sessions genuinely complete** (Project Init, Design System, Auth API, AI Chat backend)

## Root Cause

Previous sessions marked frontend display as "complete" even when:
- Only mock/hardcoded data was shown
- CRUD operations had no event handlers
- Tools had cursor changes but no implementation
- "Wired to API" meant loading data but not saving user changes

## Remediation Plan

### Phase A — Orchestration Accuracy (this session)
- Updated all 12 orchestration task lists
- Added accuracy notes to .adr/current/ phase files
- Updated TODO.md with Phases A/B/C and Tiers 1/2/3
- Established NO MOCK DATA policy

### Phase B — Complete App Functionality

**Tier 1 — Core Interactivity (user tests before Tier 2)**
1. Kanban: Card CRUD + settings button with color picker + text auto black/white
2. Ideas: Full CRUD (create, edit, delete), category management
3. Workspace Editor: Real text editor with artifact API save
4. Workspace Notes: Real note creation/editing with persistence
5. Dashboard: Wire all stats + chart to real DB aggregates
6. Remove ALL mock data site-wide

**Tier 2 — Feature Completeness (user tests before Tier 3)**
1. Whiteboard: All 5 tools (rect, text, lines/dots, add sticky, select/move)
2. Schema Planner: Real entity/field CRUD, relationship management, Prisma schema export
3. Directory Tree: GitHub API integration
4. Settings: Persist preferences, wire integrations, danger zone actions

**Tier 3 — Remaining Sessions**
1. Stripe billing (needs user's test keys)
2. Sync & conflicts UI
3. Hardening

### Phase C — Production Readiness
- Visual QA against pass-1 concepts
- Full E2E Playwright suite
- Security audit
- Performance optimization

## Critical Policy

**NO MOCK DATA:** All pages must use real database values. No mock/fallback data anywhere. Empty states shown when no data exists. This prevents false validation during Playwright screenshot testing.

## App State Summary (as of this ingest)

| View | Backend API | Frontend Display | Frontend CRUD | Persistence |
|------|------------|-----------------|---------------|-------------|
| Dashboard | YES (stats + audit log) | YES | N/A | N/A |
| Projects List | YES | YES | YES (create) | YES |
| Workspace Editor | YES (artifact API) | Display only | NO | NO |
| Workspace Notes | YES (artifact API) | Display only | NO | NO |
| Kanban | YES (artifact API) | YES | Drag only | Drag saves |
| Whiteboard | YES (artifact API) | Partial (draw+sticky) | NO (tools missing) | Draw+sticky save |
| Schema | YES (artifact API) | Display only | NO | NO |
| Directory Tree | YES (artifact API) | Display only | NO | NO |
| Ideas | YES (artifact API) | Display + filter | NO | NO |
| AI Chat | YES (streaming + sessions) | YES | YES | YES |
| Settings Profile | YES | YES | YES (email) | YES |
| Settings AI | YES | YES | YES | YES |
| Settings Prefs | NO | Display only | Toggle (no persist) | NO |

## Files Modified This Session
- All `.adr/orchestration/*/primary_task_list.md` (sessions 4-9)
- All `.adr/current/*/phase_*.md` (accuracy notes added)
- `TODO.md` (restructured with Phases/Tiers)
- `apps/web/src/app/signin/page.tsx` (fixed form sizing)
- `apps/web/src/app/signup/page.tsx` (fixed form sizing)
- `apps/web/src/components/shell/app-shell.tsx` (sidebar push, real user info, selected project)
- `apps/web/src/components/shell/top-bar.tsx` (integrated into app-shell)
- `apps/web/src/app/(authenticated)/layout.tsx` (simplified)
- `apps/web/src/app/(authenticated)/projects/page.tsx` (select project button)
- `apps/web/src/app/(authenticated)/projects/[id]/page.tsx` (select project button)
- `apps/web/src/app/(authenticated)/settings/page.tsx` (Suspense boundary)
- `apps/web/.env` (session TTL 24h for dev)
