# Phase 1 Review: Kanban Board with SortableJS Drag-Drop

## Session 5 — Kanban Board
**Date:** 2026-03-10
**Status:** Complete

## Summary

Built the kanban board view as a faithful 1:1 reproduction of the pass-1 brutalism-neobrutalism concept with SortableJS drag-and-drop between columns.

## What Was Built

- `apps/web/src/app/(authenticated)/projects/[id]/kanban/page.tsx` — Full "use client" component with:
  - **View header** using `.nb-view-title` with "+ ADD CARD" button (`.nb-btn--primary`)
  - **4 columns** — BACKLOG, TO DO, IN PROGRESS, DONE with distinct header colors matching pass-1
  - **12 mock cards** — All cards from pass-1 data, distributed 3 per column
  - **Tag system** — feature (malachite), bug (amethyst), urgent (watermelon) with IBM Plex Mono font
  - **SortableJS drag-and-drop** — Cards can be dragged between any column, counts update dynamically
  - **Responsive grid** — 1 col mobile, 2 col tablet (sm), 4 col desktop (lg)

- `apps/web/src/app/globals.css` — Added SortableJS ghost/chosen/drag CSS classes:
  - `.kanban-card--ghost` — opacity 0.4
  - `.kanban-card--chosen` — rotate(-1deg), increased shadow
  - `.kanban-card--drag` — opacity 0.8

## Design Fidelity

| Element | Pass-1 Reference | Implementation |
|---------|------------------|----------------|
| Column borders | 4px solid #282828 | border-4 border-signal-black |
| Backlog header | bg #F8F3EC | bg-creamy-milk |
| Todo header | bg #FF5E54, white text | bg-watermelon text-white |
| Progress header | bg #2BBF5D | bg-malachite |
| Done header | bg #282828, white text | bg-signal-black text-white |
| Card shadows | 3px 3px 0px #282828 | shadow-nb-kanban |
| Card hover | translate(-2px,-2px) rotate(-0.5deg), 5px shadow | hover classes matching pass-1 |
| Tag styling | 0.65rem mono, 2px border, colored bg | font-mono text-[0.65rem] with color classes |
| Count badge | IBM Plex Mono, 28x28, 2px border | font-mono w-7 h-7 border-2 border-current |
| Grid layout | repeat(auto-fit, minmax(240px,1fr)) | grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 |

## Verification

- TypeScript: No type errors in kanban page (pre-existing errors in dashboard/app-shell are unrelated)
- Visual: Screenshot confirms all 4 columns render with correct header colors, card layout, tags, and counts
- SortableJS: Configured with group "kanban", animation 200ms, ghost/chosen/drag classes
- Drag state sync: DOM-based state sync reads card order from DOM after each drag event

## Files Changed

- `apps/web/src/app/(authenticated)/projects/[id]/kanban/page.tsx` (rewritten from stub)
- `apps/web/src/app/globals.css` (added kanban drag state classes)
