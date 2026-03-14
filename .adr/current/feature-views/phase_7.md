# Phase 7: Settings + Conflicts

Session: feature-views
Phase: 7
Date: 2026-03-08

## Objective
Build settings and conflicts views matching pass-1 concept. Wire to user profile and sync endpoints.

## Tasks
1. Build settings page at `apps/web/src/app/(authenticated)/settings/page.tsx`
2. Settings sections: Profile (name/email), Preferences (theme if applicable), Billing
3. Profile edit: display current user info from GET /api/auth/me, allow updates
4. Billing section: link to Stripe customer portal (POST /api/billing/portal)
5. Display current subscription status if available
6. Build conflicts page at `apps/web/src/app/(authenticated)/projects/[id]/conflicts/page.tsx`
7. Conflicts list: show pending sync conflicts for the project
8. Conflict detail: show diff between local and remote versions
9. Resolve actions: keep-local, keep-remote buttons
10. Wire conflicts to GET sync pull (which returns conflicts) and POST resolve endpoint
11. Empty state for no conflicts
12. Neo-brutalism styling

## API:
- GET /api/auth/me — current user info
- POST /api/billing/portal — Stripe portal redirect
- GET /api/sync/pull/{projectId} — includes conflict info
- POST /api/sync/resolve/{operationId} — resolve conflict

## Output
- Settings and conflicts page components
- `.adr/history/feature-views/phase_7_review.md`
- `.docs/validation/feature-views/phase_7/user-story-report.md`
- Updated primary task list
- Session completion note

> **ACCURACY NOTE (2026-03-12):** Settings page is partially functional. Profile email display and AI config work. However: preferences (theme) do not persist, integrations section is display-only, and danger zone buttons (delete account, etc.) are non-functional. Corrected in Phase B Tier 1 remediation.
