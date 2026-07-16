# HANDOFF — cross-device agent handoff log

> **Append-only, per-device.** At every **wind-down** (`/winddown`) the agent prepends a new entry
> here; at every **pickup** (`/pickup`) the next machine's agent reads the newest entry. This is the
> living "where we left off + what's next" record that bridges home-desktop ⇄ asus-laptop.
> Full protocol: `.docs/runbooks/development/device-sync-and-handoff-protocol.md`.
>
> **Entry template** (newest on top):
> ```
> ## <YYYY-MM-DD HH:MM TZ> · <device> (<hostname>) · <agent> · branch <X>-Work @ <short-sha>
> **Synced from:** <what /pickup adopted this session, or "fresh clone">
> **What changed:** <the work done>
> **Where I stopped / state:** <current app + DB + branch state>
> **Next actions:** <ordered, concrete>
> **Blocked on (needs user/external):** <keysets, proxy creds, decisions>
> **Gotchas:** <traps the next agent must know>
> ```

---

## 2026-07-16 01:50 UTC · home-desktop (VENGEANCE) · Claude / DevFlow wind-down · lane `Home-Work` (← devflow)
**Synced from:** continued the same session; no other device active.
**What changed (since the entry below):** completed every no-creds follow-up:
- **Kanban → Tasks refactor (p3b):** the board now reads/writes first-class Tasks (column config stays in the artifact); add/edit/delete/drag persist via `/api/tasks`; legacy inline boards migrate on load; column-delete reassigns tasks; card styling preserved via `Task.externalRefs`. Kanban cards, Today, and cross-project views are now ONE coherent surface. New e2e proves add-on-board → shows-in-Today.
- **Perf pass:** Ollama probe cached (was 2s/AI-request), projects list bounded (take:200), notification panel re-fetches only when stale, AI-refresh no longer full-reloads the kanban (H4), project-settings save surfaces errors (H3).
- **Keyboard-driven UX:** `g`-nav (d/t/p/a/e/f/r/s), `c` capture, `/` palette, `?` help overlay. Projects list skeletons.
**Where I stopped / state:** device.local.md set to **home-desktop** (VENGEANCE) — flip the box if this is actually the asus-laptop. All work squashed onto lane `Home-Work` and **pushed to `origin/Home-Work` + fast-forwarded `origin/main`**. App runs on **:3001**. typecheck 0 · vitest 198 pass (+8 skipped live) · e2e 24 core+new specs green.
**Next actions:** add creds to go live (`RESEND_API_KEY`, `GOOGLE_CLIENT_ID/SECRET` + register OAuth redirect). Remaining minor polish: H4 on whiteboard/schema/directory (still `window.location.reload` on AI edits — kanban is done); broader skeletons.
**Blocked on (needs user):** external creds for live OAuth/email.
**Gotchas:** e2e needs `E2E_BASE_URL=http://localhost:3001`. Prisma client output is `src/generated/prisma`; regenerating requires the dev server stopped (Windows DLL lock).

## 2026-07-16 00:45 UTC · (device unset) (VENGEANCE) · Claude / DevFlow · branch `devflow` @ 40a4c33
**Synced from:** started on `main` (= origin/main); no device lanes exist yet.
**What changed:** Full audit + de-flake + 3 feature phases, all on branch `devflow` (NOT pushed — device routing unresolved):
- **P1 Audit/fix:** de-flaked the whole e2e suite (unique X-Forwarded-For per test → no shared rate-limit bucket; `networkidle`→`domcontentloaded`; stable `data-testid`s). Added a real **Sign Out** (was missing). Audit fixes: open-redirect on signin (H1), dashboard queries parallelised (H5), dropped redundant AI-route user query (M8), error boundary hides internals in prod (M14). Rewrote stale AI chat tests; gated the live integration test. Corrected the CLAUDE.md stack header (was Convex/Clerk — actually Prisma/Postgres + custom auth). M11 hot-path indexes.
- **P2 Snappy:** global **Cmd-K command palette** (registry-extensible; nav/actions/project-switcher) wired to the previously-dead top-bar search (H2). Optimistic project create (H3).
- **P3 Tasks:** first-class **Task** model + migration + `/api/tasks` + **Today / My Work** page (quick-capture, local-day buckets, optimistic complete/reschedule/delete). Backfill script `pnpm tasks:backfill`.
- **P4 Integrations:** provider registry + encrypted store + **Settings→Integrations** UI. Wired Email (Today digest), Gmail (OAuth+list/send), Google Calendar (task→event), VS Code (deep links) — all cred-gated + mock-tested.
**Where I stopped / state:** App runs on **:3001** (`:3000` is a different project, CarAggregator — do not kill it). DB migrated. typecheck 0, vitest 198 pass (+8 skipped live), e2e core+new 23 specs green. All work committed on `devflow` (8 commits). Dev server was restarted once for `prisma generate` (Windows DLL lock).
**Next actions:** (1) Decide how to route `devflow` → device lane / `main`. (2) Add creds to go live: `RESEND_API_KEY` (email), `GOOGLE_CLIENT_ID`/`SECRET` (Gmail+Calendar) + register redirect `…/api/integrations/<provider>/callback`. (3) Optional follow-ups: full kanban UI refactor onto Tasks (currently backfill snapshot); Phase-2 polish (g-key shortcuts, `?` help, skeletons, avoid `window.location.reload` on AI actions = H4).
**Blocked on (needs user):** device.local.md is unset (no device checked); external creds for live OAuth/email round-trips.
**Gotchas:** e2e must run with `E2E_BASE_URL=http://localhost:3001`. Rate limit is real (5 signin/15min per IP) — the suite dodges it via unique XFF; a `RATE_LIMIT_DISABLED=1` non-prod env also bypasses. Prisma client output is `src/generated/prisma` (custom path).

<!-- First real entry is prepended here by the first /winddown on this repo. -->
