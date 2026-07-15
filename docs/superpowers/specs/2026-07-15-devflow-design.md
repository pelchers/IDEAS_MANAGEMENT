# DevFlow — Design Spec

**Date:** 2026-07-15
**Branch:** `devflow`
**Status:** Approved (scope + architecture forks confirmed with user)

## Goal
Audit and harden the idea-management app (fix flaky tests + bad UX), then add
developer-productivity features for a busy software developer. The app must feel
**snappy and clean**, and be architected so external-service integrations
(email/Gmail, calendars, VS Code, and more) plug in cleanly.

## Context (verified)
- Stack: Next.js 16 (App Router) + React 19 + Prisma/PostgreSQL + custom argon2 auth
  (NOT Convex/Clerk — the CLAUDE.md header is stale). Runs on `:3001` locally
  (`:3000` is a different project, CarAggregator).
- Data model is artifact-based: kanban/ideas/whiteboard/schema live as JSON in
  `ProjectArtifact`. There is **no first-class Task model** yet.
- No global command palette. No external-integration model (only AES-256-GCM
  encrypted AI provider keys on `User`).
- Auth is rate-limited (5 signin/15min per IP, shared `signin:unknown` bucket for
  localhost) — this makes the e2e suite throttle itself. Older specs also use
  `networkidle` (never settles vs the always-on notification SSE) and stale selectors.

## Decisions (user-confirmed)
1. Build all four phases, in order.
2. Add a **first-class Task model** (migration + refactor kanban from artifact JSON
   to Task rows, with data migration).
3. Wire **all** integrations at the code level (email first), cred-gated and
   validated by tests with mocked providers. Real creds added post-session; a live
   round-trip is the only step deferred.
4. Commit at milestones on `devflow`; do not push (device routing unresolved).

## Guiding principles
- Every mutation is **optimistic** and **keyboard-reachable**.
- Every integration is a **pluggable provider** that degrades gracefully to a
  "Connect / Not configured" state when creds are absent.
- Everything ships with tests so it is prod-ready before keys are added.

---

## Phase 1 — Audit & Fix (foundation)
- Run the audit-system across perf, security, a11y, code-quality, UX, API-contract;
  triage by severity; fix high/critical + quick UX wins.
- De-flake e2e:
  - Test-env rate-limit bypass: unique `X-Forwarded-For` per test context (helper)
    **and** an `E2E`/`RATE_LIMIT_DISABLED`-gated skip in `rate-limit.ts` (test/dev only).
  - Replace `networkidle` with `domcontentloaded` + explicit element waits in
    `helpers.ts` and older specs.
  - Add stable `data-testid`s; fix stale assertions/selectors
    (`Create Account`→`Sign Up`, `.auth-error`→real error node).
- Refresh `TODO.md`; correct the `CLAUDE.md` stack header.

## Phase 2 — Snappy UX layer
- Global **Cmd-K command palette** built on a **command registry** (`registerCommand`)
  so features/integrations contribute commands. Includes: fuzzy route nav, project
  switcher, recent items, and actions (new project/task/idea, quick-capture, toggle theme).
- **Keyboard shortcuts** (`g d`, `g p`, `c`=capture, `/`=search, `?`=help overlay).
- **Optimistic UI** on kanban/ideas/task mutations; **loading skeletons**; **route prefetch**.

## Phase 3 — Task model + Today / My Work
- `Task` model: `id, projectId, title, description, status (enum), priority (enum),
  dueDate?, assigneeId?, labels[], order, source, externalRefs Json, createdById,
  timestamps`. `externalRefs` links calendar events / emails later.
- Migration + data migration: convert existing kanban `ProjectArtifact` cards → `Task`
  rows; refactor kanban board to read/write via `/api/tasks` (column config stays in
  the artifact). Backward-compatible; idempotent migration script.
- `/api/tasks` (list w/ filters: `assignee=me`, `due`, `project`, `status`), CRUD,
  `/api/tasks/today` (aggregated: overdue / today / upcoming).
- **Today / My Work** view (new nav item): cross-project grouped list, inline
  complete + reschedule, quick-capture (also from Cmd-K → Inbox or chosen project).

## Phase 4 — Integrations spine + wire all (email first)
- `Integration` model: `userId, provider (enum), status, config Json (encrypted),
  scopes[], connectedAt, timestamps`. Reuse AES-256-GCM helper for tokens.
- **Provider registry**: each provider is a module implementing a common interface
  (`id, label, capabilities, isConfigured(), connect(), disconnect(), actions`).
  Server abstraction + **Settings → Integrations** UI (connect cards, status, disconnect).
- Wired code-complete, cred-gated, mock-tested:
  - **Email** (first): adapters (Resend/SES/SMTP) atop existing `server/email/send.ts`;
    "email me my Today digest" action.
  - **Gmail**: OAuth scaffold + read/search/send; "create task from email".
  - **Google Calendar**: task `dueDate` ↔ event (create/update).
  - **VS Code**: `vscode://` deep-links ("Open in VS Code" on project/directory-tree) — no creds.
  - Registry makes "and more" a drop-in module.

## Cross-cutting
- Performance/snappiness throughout; unit + e2e tests per phase; commit at milestones;
  new ADR phase (`15_devflow`) + TODO updates.

## Deferred (needs user)
- Live OAuth/API round-trips against Google/Resend/etc. (needs real creds). All code
  paths are written and mock-tested; only the live handshake is deferred.

## Testing strategy
- Unit tests (vitest) for: command registry, task API + migration, rate-limit bypass,
  each integration provider (mocked transport), email adapters.
- E2E (Playwright) for: command palette, Today view + quick-capture, kanban-on-Tasks,
  Settings→Integrations connect/disconnect (mocked). Suite must run green locally
  after the de-flake.
