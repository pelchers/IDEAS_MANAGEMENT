# Primary Task List — 11_sync-and-conflicts

Session: Sync and Conflicts
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism) for UI elements

---

## Phase 1 — Sync Infrastructure

- [ ] Verify existing sync API routes (push, pull, force, resolve)
- [ ] Verify sync queue implementation in apps/web/src/lib/sync-queue.ts
- [ ] Build sync status indicator component with neo-brutalist styling
- [ ] Add sync status to app shell (top bar or sidebar)

## Phase 2 — Conflict Resolution UI

- [ ] Build conflict list page at /projects/[id]/conflicts
- [ ] Display conflicting artifacts with diff view
- [ ] Add resolve actions: accept local, accept remote, manual merge
- [ ] Style conflict UI with neo-brutalist patterns (thick borders, watermelon for conflicts)

## Phase 3 — Sync Testing

- [ ] Playwright screenshots of sync status and conflict UI
- [ ] User story validation: trigger conflict, view diff, resolve conflict
- [ ] Test force push and force pull operations
