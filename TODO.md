# TODO — IDEA MANAGEMENT

> **For the human.** Quick-glance kanban of what's happening, what's next, what's done, and what's deferred.
> Updated by orchestrator agents and during planning conversations. Skim this before diving into code.

---

## IN PROGRESS

_Nothing active right now._

---

## TODO NEXT

- [ ] Configure AI API key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`) and test AI chat end-to-end
- [ ] Configure Stripe test keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) and test billing flow
- [ ] Build proper project overview/landing page at `/projects/[id]` with links to all subviews
- [ ] Add email service integration (SendGrid, Resend, etc.) for password reset and email verification
- [ ] Visual QA pass — open every view in browser, compare against pass-1 concept screenshots, fix discrepancies

---

## COMPLETED

### Backend Foundation (5 phases)
- [x] Prisma schema audit — 18 tables verified, admin account seeded
- [x] Auth endpoints — signup, signin, signout, refresh, verify-email, password-reset all working (11/11)
- [x] Project CRUD + members — create, list, get, update, delete, member add/remove/role (7/7). Fixed missing PATCH endpoint for member role changes
- [x] Artifact + Sync + AI endpoints — artifact read/write with revision, sync push/pull/force/resolve, AI session CRUD, chat endpoint (9/9). Fixed AI chat error handling for missing API key
- [x] Billing + Proxy + Health — health endpoint, proxy auth enforcement, billing checkout/portal/webhook (7/7). Fixed billing endpoints crashing on missing Stripe keys

### Frontend Shell (4 phases)
- [x] Design system transfer — pass-1 concept CSS fully transferred to globals.css (391 -> 3045 lines). All tokens, components, layouts, animations, responsive breakpoints
- [x] App shell + navigation — `(authenticated)` route group layout, AppShell component with hamburger drawer, sidebar nav, top bar, signout, user info fetch (10/10)
- [x] Auth pages — signin + signup rebuilt with neo-brutalism styling, client-side validation, error handling, redirect flow (9/9)
- [x] Dashboard page — project grid/list views, create form, search/sort/filter, status badges, responsive layout (13/13)

### Feature Views (7 phases)
- [x] Kanban board — columns, cards, HTML5 drag-and-drop, column/card CRUD, artifact API, debounced save (13/13)
- [x] Ideas capture — idea cards grid, quick-add, full form, categories, priority colors, search/filter (15/15)
- [x] Whiteboard — SVG-based canvas, 6 drawing tools, color palette, pan/zoom, text editing, auto-save (24/24)
- [x] Schema planner — entity cards, field CRUD, type dropdown, required/unique toggles, relationship display (21/21)
- [x] Directory tree — nested tree, expand/collapse, file/folder icons, inline rename, delete confirmation, ASCII preview (14/14)
- [x] AI chat — two-panel layout, session CRUD, neo-brutalist chat bubbles, tool action buttons, streaming, not-configured handling (45/45)
- [x] Settings + conflicts — profile display, billing portal link, conflict list with resolve actions (28/28)

### Integration Hardening (5 phases)
- [x] E2E flow validation — full user journey (signup -> artifacts -> signout), all pages load, auth protection, TypeScript clean (30/30)
- [x] Security audit — auth protection on all routes, session security, CSRF via SameSite, no XSS vectors, Stripe webhook validation (24/24)
- [x] UX polish — loading states, error boundaries, field validation, debounced saves across all views. Fixed 14 UX issues (45/45)
- [x] Playwright E2E test suite — 17 tests across 4 spec files, 20 validation screenshots (desktop + mobile). Fixed kanban cardIds null guard
- [x] Production readiness — health endpoint DB check, error logging on auth/project routes, .env.example updated, deployment checklist (6/6)

### Infrastructure
- [x] ADR restructured into 4 longrunning sessions (backend-foundation, frontend-shell, feature-views, integration-hardening)
- [x] Orchestration system updated with context handoff, startup reading, mandatory validation protocols
- [x] Orchestration files synced to .claude/, .codex/, template repo, and 3 external repos

---

## TODO FUTURE

- [ ] Real-time sync — WebSocket or SSE for live updates between multiple clients
- [ ] Rate limiting — on auth endpoints and API routes (security recommendation)
- [ ] Security headers — `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- [ ] Remove `_dev` token exposure from signup/password-reset responses before production
- [ ] Account lockout after repeated failed login attempts
- [ ] Production deployment — real PostgreSQL, `NODE_ENV=production`, `Secure` cookie flag
- [ ] Drag-and-drop for directory tree (move files between folders)
- [ ] Whiteboard undo/redo
- [ ] Kanban card labels/colors customization
- [ ] User avatar upload
- [ ] Project invite by email
- [ ] Notifications system
- [ ] Dark mode toggle
- [ ] Mobile-optimized whiteboard controls
