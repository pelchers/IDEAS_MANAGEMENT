# Session Notes

Session: frontend-shell
Date: 2026-03-07

## Context
The app was restyled with a surface-level CSS transfer (~390 lines) that didn't capture the full pass-1 concept (1892 lines CSS, 687 lines JS, 556 lines HTML). This session strips down the frontend and rebuilds it from the pass-1 concept exactly.

## Known Issues
- Current globals.css is only ~390 lines vs pass-1's 1892 lines
- App shell (hamburger drawer, top bar) was never built — only individual page content was restyled
- Layout structures, animations, and interaction patterns from pass-1 are missing
- Auth pages exist but styling is shallow

## Dependencies
- Depends on backend-foundation session completing auth endpoints (Phase 2)
- Dashboard wiring depends on backend-foundation completing project CRUD (Phase 3)
