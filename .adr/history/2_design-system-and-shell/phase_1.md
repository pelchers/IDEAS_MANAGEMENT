Phase: phase_1
Session: 2_design-system-and-shell
Date: 2026-03-10
Owner: orchestrator
Status: complete

# Phase 1 — Tailwind Config + Global CSS from Pass-1

## Objectives
Convert the entire pass-1 style.css (1892 lines) into a Tailwind CSS configuration
and globals.css that produces visually identical output. This is the design system
foundation for the entire faithful rebuild.

## Tasks
- [x] Read pass-1 style.css completely (1892 lines) at .docs/planning/concepts/brutalism-neobrutalism/pass-1/style.css
- [x] Create/update Tailwind config with all pass-1 design tokens (via @theme in globals.css — Tailwind 4 uses CSS-based config):
  - Colors: signal-black (#282828), creamy-milk (#F8F3EC), watermelon (#FF5E54), malachite (#2BBF5D), cornflower (#1283EB), lemon (#FFE459), amethyst (#7B61FF), white (#FFFFFF)
  - Fonts: Space Grotesk (sans), IBM Plex Mono (mono)
  - Shadows: nb-sm (2px 2px 0px), nb (4px 4px 0px), nb-lg (6px 6px 0px) — all signal-black
  - Borders: via :root custom properties (--border-thick, --border-thicker)
  - Screens: pass-1 responsive breakpoints
- [x] Update globals.css with:
  - @import "tailwindcss"
  - Google Fonts imports (Space Grotesk 400/500/700, IBM Plex Mono 400/600)
  - Scrollbar styling (14px thick, signal-black track, watermelon hover thumb)
  - Animation keyframes: slam (cubic-bezier(0.2,0,0,1)), hover transforms
  - Base resets matching pass-1 (body background, text color, font-family)
  - Component-level classes that are too complex for inline Tailwind (cards, buttons, inputs)
- [x] Verified design tokens render correctly via dev server
- [x] Verified CSS output matches pass-1 design system

## Deliverables
- globals.css with @theme design system, scrollbar styling, animations, base resets, component classes
- Visual parity with pass-1 style.css

## Validation Checklist
- [x] All pass-1 colors available as Tailwind utilities
- [x] All pass-1 shadows available as Tailwind utilities
- [x] Scrollbars match pass-1 (14px, watermelon hover)
- [x] Slam animation timing matches pass-1
- [x] Phase review created
- [x] Committed and pushed
