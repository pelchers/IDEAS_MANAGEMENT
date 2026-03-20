# Remaining Backend Work

> **Updated 2026-03-20.** Most sessions are now fully wired to real backend APIs.

---

## Session 4 — Dashboard & Projects ✅

- [x] Dashboard stats from real Prisma queries (GET /api/dashboard)
- [x] Activity feed from audit log table
- [x] Projects list wired to GET /api/projects
- [x] Create project form wired to POST /api/projects
- [x] Project detail page loads real project data by ID

## Session 5 — Kanban ✅

- [x] Kanban board persistence via artifact API
- [x] Card CRUD wired to artifact API
- [x] Auto-save on changes

## Session 6 — Whiteboard ✅

- [x] Whiteboard persistence via artifact API
- [x] Save/load canvas state as JSON
- [x] Auto-save on drawing/sticky changes

## Session 7 — Schema Planner ✅

- [x] Schema persistence via artifact API
- [x] Full entity/field/relation CRUD + comprehensive PG features
- [x] Auto-save on changes

## Session 8 — Ideas & Directory Tree & Settings ✅

- [x] Ideas CRUD via artifact API with auto-save
- [x] Quick capture form
- [x] Directory tree CRUD via artifact API (GitHub import, local import, paste tree)
- [x] Settings preferences persisted to DB (JSON field)
- [x] Export all data, delete account functional
- [x] Integrations wired (GitHub, Slack, Stripe)

## Session 9 — AI Chat ✅

- [x] Multi-provider: OpenRouter, OpenAI, Anthropic, Google, Ollama local
- [x] BYOK with auto-detect from key prefix
- [x] AI Configuration in Settings with all 6 provider options
- [x] Chat sessions CRUD via Prisma
- [x] Message persistence per session
- [x] Streaming responses via Vercel AI SDK
- [x] 12 cross-page tools that write to real artifacts
- [x] Contextual AI helper on all pages
- [x] Built-in local AI via Ollama (Ministral 3B)

## Session 10 — Stripe Billing — NOT STARTED

- [ ] Billing UI: plan cards, manage subscription button, billing history
- [ ] Wire plan selection to POST /api/billing/checkout
- [ ] Wire manage button to POST /api/billing/portal
- [ ] Test webhook handling for subscription lifecycle
- [ ] Entitlement gates on features

## Session 11 — Sync & Conflicts — NOT STARTED

- [ ] Sync status indicator in app shell
- [ ] Conflict detection on artifact save (version mismatch)
- [ ] Conflict resolution UI at /projects/[id]/conflicts
- [ ] Accept local / accept remote / manual merge actions

## Session 12 — Hardening — NOT STARTED

- [ ] Error boundaries and graceful degradation
- [ ] Loading states and skeletons
- [ ] Rate limiting on API routes
- [ ] Input sanitization and validation (Zod end-to-end)
- [ ] Accessibility audit
- [ ] Security review
- [ ] Full E2E Playwright validation
