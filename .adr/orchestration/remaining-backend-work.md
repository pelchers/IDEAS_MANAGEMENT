# Remaining Backend Work

> **Context:** Sessions 1–9 completed frontend-only builds. All views render with mock/hardcoded data. Only auth (signin/signup/signout) is wired to real API routes. The backend uses Prisma + PostgreSQL with Next.js API routes (NOT Convex). This document tracks what still needs to be wired for each session.

---

## Session 4 — Dashboard & Projects

- [ ] Dashboard stats (project count, idea count, task count) from Prisma queries via API route
- [ ] Activity feed from audit log table (GET /api/audit or new endpoint)
- [ ] Projects list wired to GET /api/projects (already exists and works)
- [ ] Create project form wired to POST /api/projects (already exists)
- [ ] Project detail page loads real project data by ID (GET /api/projects/[id])

## Session 5 — Kanban

- [ ] Kanban board persistence via artifact API (GET/PUT /api/projects/[id]/artifacts/kanban/board)
- [ ] Drag-and-drop state changes saved via debounced PUT
- [ ] Card CRUD (create, edit, delete, move) wired to artifact API
- [ ] Auto-save on column/card changes

## Session 6 — Whiteboard

- [ ] Whiteboard persistence via artifact API (GET/PUT /api/projects/[id]/artifacts/whiteboard/board)
- [ ] Save/load canvas state (drawings array, sticky note positions) as JSON
- [ ] Auto-save on drawing/sticky changes

## Session 7 — Schema Planner

- [ ] Schema persistence via artifact API (GET/PUT /api/projects/[id]/artifacts/schema/schema.graph)
- [ ] Save/load entity graph as JSON
- [ ] Auto-save on entity/field changes

## Session 8 — Ideas & Directory Tree & Settings

- [ ] Ideas CRUD via API routes (GET/POST/PUT/DELETE /api/projects/[id]/ideas)
- [ ] Idea capture form saves to DB
- [ ] Directory tree from artifact API (GET/PUT /api/projects/[id]/artifacts/directory/tree)
- [ ] Settings save to user profile (PUT /api/auth/me)
- [ ] Theme/preference persistence in user record

## Session 9 — AI Chat

- [ ] OpenRouter OAuth PKCE flow (redirect to OpenRouter, handle callback, store user-scoped API key)
- [ ] BYOK fallback (user pastes OpenAI/Anthropic key, encrypted storage in user record)
- [ ] AI Configuration section in Settings (connect button + BYOK input)
- [ ] Chat sessions CRUD via API routes (GET/POST/DELETE /api/ai/sessions)
- [ ] Message persistence to Prisma per session
- [ ] Streaming responses via Vercel AI SDK + OpenRouter provider using user's key
- [ ] Model selection dropdown (fetched from OpenRouter API)
- [ ] Error state when no AI configured — prompt to connect account

## Session 10 — Stripe Billing

- [ ] Stripe checkout session creation (POST /api/billing/checkout — already exists)
- [ ] Stripe customer portal (POST /api/billing/portal — already exists)
- [ ] Webhook handling for subscription lifecycle events (POST /api/billing/webhook — already exists)
- [ ] Billing UI: plan cards, manage subscription button, billing history
- [ ] Entitlement model (Free/Pro/Team tier gates)
- [ ] Note: AI costs are separate — handled by OpenRouter (user's own account), not Stripe

## Session 11 — Sync & Conflicts

- [ ] Sync status indicator in app shell
- [ ] Conflict detection on artifact save (version mismatch)
- [ ] Conflict resolution UI at /projects/[id]/conflicts
- [ ] Accept local / accept remote / manual merge actions
- [ ] Optimistic updates for mutations

## Session 12 — Hardening (Cyclic)

- [ ] Error boundaries and graceful degradation for all views
- [ ] Loading states and skeletons for all async operations
- [ ] Rate limiting on API routes
- [ ] Input sanitization and validation (Zod schemas end-to-end)
- [ ] Accessibility audit and fixes
- [ ] Performance profiling and optimization
- [ ] Security review (auth gates, data isolation per user)
- [ ] Full E2E Playwright validation across all views
- [ ] Visual comparison against pass-1 screenshots
