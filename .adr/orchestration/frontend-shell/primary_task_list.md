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
- [ ] Extract all CSS variables, tokens, and mixins from pass-1 concept (1892 lines)
- [ ] Build globals.css with full neo-brutalism system (colors, typography, borders, shadows, spacing)
- [ ] Import Space Grotesk + IBM Plex Mono fonts in layout.tsx
- [ ] Create utility classes matching pass-1 patterns (.nb-card, .nb-btn, .nb-input, .nb-badge, etc.)
- [ ] Verify design tokens render correctly in isolation

## Phase 2: App Shell + Navigation
- [ ] Build hamburger drawer / sidebar from pass-1 concept
- [ ] Build top bar with user info, search, notifications
- [ ] Implement responsive layout (desktop sidebar, mobile drawer)
- [ ] Add view switching / route navigation
- [ ] Wire up signout button to /api/auth/signout
- [ ] Test shell renders on all breakpoints (desktop, tablet, mobile)

## Phase 3: Auth Pages
- [ ] Rebuild signin page matching pass-1 styling exactly
- [ ] Rebuild signup page matching pass-1 styling exactly
- [ ] Add client-side validation (12+ char password, email format)
- [ ] Add error/success feedback with neo-brutalism styled alerts
- [ ] Test auth flow end-to-end (signup -> signin -> dashboard redirect)

## Phase 4: Dashboard Page
- [ ] Rebuild dashboard matching pass-1 layout (grid, cards, stats)
- [ ] Wire project list to GET /api/projects
- [ ] Wire project creation to POST /api/projects
- [ ] Add search, sort, filter controls matching pass-1
- [ ] Add grid/list view toggle
- [ ] Test with 0, 1, and 5+ projects
