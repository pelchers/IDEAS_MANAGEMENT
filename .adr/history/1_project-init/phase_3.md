Phase: phase_3
Session: 1_project-init
Date: 2026-03-10
Owner: orchestrator
Status: complete

# Phase 3 — Frontend Cleanup

## Objectives
Remove all deprecated frontend code that will be rebuilt from the pass-1 concept.
Keep all API routes, Prisma schema, and config files intact. Verify the app still
builds and API routes still respond after cleanup.

## Tasks
- [x] Remove all page files under apps/web/src/app/(authenticated)/ (dashboard, projects, ai, settings and all nested routes)
- [x] Keep the (authenticated)/layout.tsx file but strip its content to a minimal wrapper
- [x] Remove apps/web/src/app/signin/page.tsx
- [x] Remove apps/web/src/app/signup/page.tsx
- [x] Remove apps/web/src/app/globals.css (will be rebuilt with Tailwind in session 2)
- [x] Remove apps/web/src/components/shell/app-shell.tsx (will be rebuilt in session 2)
- [x] Remove apps/web/src/components/ai/ directory (will be rebuilt in session 9)
- [x] Keep ALL files under apps/web/src/app/api/ (backend API routes)
- [x] Keep apps/web/src/app/layout.tsx (root layout)
- [x] Keep apps/web/src/app/page.tsx (landing page)
- [x] Keep apps/web/src/lib/ (sync queue, utilities)
- [x] Keep apps/web/prisma/ (schema and migrations)
- [x] Create minimal placeholder globals.css (just Tailwind imports)
- [x] Create minimal placeholder (authenticated)/layout.tsx
- [x] Create stub pages for all 10 routes so nav doesn't 404:
  - /dashboard, /projects, /projects/[id], /projects/[id]/kanban,
  - /projects/[id]/whiteboard, /projects/[id]/schema,
  - /projects/[id]/directory-tree, /projects/[id]/ideas,
  - /ai, /settings
- [x] Start dev server, verify it compiles, hit /api/health, then stop server

## Deliverables
- Clean frontend ready for pass-1 faithful conversion
- Minimal stub pages so routing works
- API routes unaffected

## Validation Checklist
- [x] All deprecated frontend removed
- [x] All API routes still respond
- [x] Dev server starts and compiles cleanly
- [x] /api/health returns 200
- [x] Phase review created
- [x] Committed and pushed
