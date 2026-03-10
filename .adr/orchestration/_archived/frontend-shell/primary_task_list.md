# Primary Task List

Session: frontend-shell
Date: 2026-03-07

Sources:
- `.docs/planning/prd.md`
- `.docs/planning/concepts/brutalism-neobrutalism/pass-1/`
- `.docs/planning/technical-specification.md`

Legend: `[ ]` pending, `[x]` done, `[~]` in progress.

---

## Phase 1: Design System Transfer
- [x] Extract all CSS variables, tokens, and mixins from pass-1 concept (1892 lines)
- [x] Build globals.css with full neo-brutalism system (colors, typography, borders, shadows, spacing)
- [x] Import Space Grotesk + IBM Plex Mono fonts in layout.tsx
- [x] Create utility classes matching pass-1 patterns (.nb-card, .nb-btn, .nb-input, .nb-badge, etc.)
- [x] Verify design tokens render correctly in isolation

## Phase 2: App Shell + Navigation
- [x] Build hamburger drawer / sidebar from pass-1 concept
- [x] Build top bar with user info, search, notifications
- [x] Implement responsive layout (desktop sidebar, mobile drawer)
- [x] Add view switching / route navigation
- [x] Wire up signout button to /api/auth/signout
- [x] Test shell renders on all breakpoints (desktop, tablet, mobile)

## Phase 3: Auth Pages
- [x] Rebuild signin page matching pass-1 styling exactly
- [x] Rebuild signup page matching pass-1 styling exactly
- [x] Add client-side validation (12+ char password, email format)
- [x] Add error/success feedback with neo-brutalism styled alerts
- [x] Test auth flow end-to-end (signup -> signin -> dashboard redirect)

## Phase 4: Dashboard Page
- [x] Rebuild dashboard matching pass-1 layout (grid, cards, stats)
- [x] Wire project list to GET /api/projects
- [x] Wire project creation to POST /api/projects
- [x] Add search, sort, filter controls matching pass-1
- [x] Add grid/list view toggle
- [x] Test with 0, 1, and 5+ projects
