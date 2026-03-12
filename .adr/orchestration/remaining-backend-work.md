# Remaining Backend Work

> **Context:** Sessions 1–9 completed frontend-only builds. All views render with mock/hardcoded data. Only auth (signin/signup/signout via Clerk) is wired to a real API. This document tracks what still needs to be wired for each session.

---

## Session 4 — Dashboard & Projects

- [ ] Dashboard stats (project count, idea count, recent activity) from Convex queries
- [ ] Activity feed from audit log / recent mutations
- [ ] Projects list from Convex `projects` table
- [ ] Create/edit/delete project wired to Convex mutations
- [ ] Project detail page loads real project data by ID

## Session 5 — Kanban

- [ ] Kanban board persistence via Convex artifact API (columns, cards, ordering)
- [ ] Drag-and-drop state changes saved to DB
- [ ] Card CRUD (create, edit, delete, move) wired to mutations
- [ ] Real-time sync across clients (Convex subscriptions)

## Session 6 — Whiteboard

- [ ] Whiteboard persistence via Convex artifact API (nodes, edges, positions)
- [ ] Save/load whiteboard state per project
- [ ] Real-time collaboration sync (Convex subscriptions)
- [ ] Export functionality wired to backend

## Session 7 — Schema Planner

- [ ] Schema persistence via Convex artifact API (entities, fields, relationships)
- [ ] Save/load schema per project
- [ ] Validation logic on backend (field types, relationship constraints)
- [ ] Export schema to code/SQL wired to backend

## Session 8 — Ideas & Directory Tree & Settings

- [ ] Ideas list from Convex `ideas` table (CRUD operations)
- [ ] Idea capture form saves to DB
- [ ] Directory tree from Convex artifact API (folder/file hierarchy per project)
- [ ] Settings save to user profile (Convex `users` table or `/api/auth/me`)
- [ ] Theme/preference persistence

## Session 9 — AI Chat

- [ ] OpenRouter OAuth PKCE flow (redirect, callback, token storage)
- [ ] BYOK fallback (API key validation and encrypted storage)
- [ ] AI Configuration UI in Settings wired to backend
- [ ] Chat sessions CRUD via Convex
- [ ] Message persistence to Convex per session
- [ ] Streaming responses via Vercel AI SDK + OpenRouter provider
- [ ] Model selection from OpenRouter API

## Session 10 — Stripe Billing

- [ ] Stripe checkout session creation (POST /api/billing/checkout)
- [ ] Stripe customer portal (POST /api/billing/portal)
- [ ] Webhook handling for subscription lifecycle events
- [ ] Entitlement model (Free/Pro/Team tier gates)
- [ ] Billing history display from Stripe API
- [ ] Note: AI costs are separate — handled by OpenRouter, not Stripe

## Session 11 — Sync Infrastructure

- [ ] Convex real-time subscriptions for all data types
- [ ] Optimistic updates for mutations
- [ ] Conflict resolution strategy
- [ ] Offline queue / retry logic
- [ ] Cross-tab state consistency

## Session 12 — Hardening

- [ ] Error boundaries and graceful degradation for all views
- [ ] Loading states for all async operations
- [ ] Rate limiting on API routes
- [ ] Input sanitization and validation (Zod schemas end-to-end)
- [ ] Accessibility audit and fixes
- [ ] Performance profiling and optimization
- [ ] Security review (auth gates, data isolation per user/workspace)
