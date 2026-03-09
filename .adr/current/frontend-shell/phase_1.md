# Phase 1: Design System Transfer

Session: frontend-shell
Phase: 1
Date: 2026-03-07

## Prior Session Summary
backend-foundation session complete: All 25 API endpoints validated against live dev server. 38/38 user stories pass. 4 fixes applied (missing PATCH member endpoint, AI chat error handling, billing checkout/portal Stripe key validation).

## Objective
Extract the FULL neo-brutalism design system from pass-1 concept (1892 lines CSS) and transfer it to the app's globals.css. This is NOT a surface-level token swap — it must include every layout structure, component style, animation, and interaction pattern from the concept.

## Tasks
1. Read the pass-1 concept files thoroughly:
   - `.docs/planning/concepts/brutalism-neobrutalism/pass-1/styles.css` (1892 lines)
   - `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (556 lines)
   - `.docs/planning/concepts/brutalism-neobrutalism/pass-1/script.js` (687 lines)
2. Extract ALL design tokens from pass-1:
   - Color palette (Signal Black #282828, Creamy Milk #F8F3EC, Watermelon #FF5E54, Malachite #2BBF5D, Cornflower #1283EB, Lemon #FFE459, Amethyst #7B61FF)
   - Typography (Space Grotesk body, IBM Plex Mono code/labels)
   - Borders (3-4px solid black)
   - Shadows (4px 4px 0px hard, no blur)
   - Border radius (0 everywhere)
   - Spacing scale
3. Transfer ALL component styles:
   - Cards, buttons (primary, secondary, success, danger, info), inputs, selects, textareas
   - Badges, tags, labels, tooltips
   - Navigation (sidebar/drawer, top bar)
   - Tables, lists, grids
   - Modals, dropdowns, menus
   - Loading states, empty states
   - Scrollbar styling
4. Transfer ALL layout structures:
   - App shell (sidebar + main content area)
   - Header/top bar
   - Grid systems
   - Flex utilities
   - Responsive breakpoints
5. Transfer ALL animations and transitions from pass-1
6. Update layout.tsx with correct font imports (Space Grotesk + IBM Plex Mono)
7. Verify globals.css is comprehensive (~1800+ lines, matching pass-1 scope)

## Validation
- Visual inspection: globals.css covers all pass-1 design patterns
- Font import works in layout.tsx
- No compilation errors

## Output
- `apps/web/src/app/globals.css` — complete rewrite (~1800+ lines)
- `apps/web/src/app/layout.tsx` — font imports verified
- `.adr/history/frontend-shell/phase_1_review.md`
- `.docs/validation/frontend-shell/phase_1/user-story-report.md`
- Updated primary task list
