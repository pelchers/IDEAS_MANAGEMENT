# Phase 1 Review — Monorepo and Dependencies

Session: 1_project-init
Phase: 1
Date: 2026-03-10
Status: complete

## Summary

Verified the pnpm monorepo structure with Turbo, confirmed all production dependencies, and installed
the pass-1 brutalism-neobrutalism concept libraries (Chart.js, SortableJS, Rough.js, Tailwind CSS 4).

## Tasks Completed

- [x] Verified pnpm monorepo with Turbo is configured correctly
  - Root `package.json` specifies `pnpm@10.26.2` as packageManager
  - `pnpm-workspace.yaml` includes `apps/*` and `packages/*`
  - 4 workspace packages: `packages/schemas`, `packages/domain`, `packages/ui`, `packages/sdk`
- [x] Verified apps/web package.json has required deps
  - next 16.1.6, react 19.2.3, @prisma/client 6.16.1, stripe 20.4.0, ai SDK 6.x, argon2 0.44.0, zod 4.1.5
- [x] Installed Tailwind CSS 4.2.1 + @tailwindcss/postcss + postcss
- [x] Created `postcss.config.mjs` for Tailwind CSS 4 integration
- [x] Installed chart.js 4.5.1 + react-chartjs-2 5.3.1
- [x] Installed sortablejs 1.15.7 + @types/sortablejs 1.15.9
- [x] Installed roughjs 4.6.6
- [x] Verified TypeScript configuration (tsconfig.json) — valid
- [x] Verified ESLint configuration (eslint.config.mjs) — valid with next core-web-vitals + typescript
- [x] Verified Turbo build pipeline (turbo.json) — build, dev, lint, typecheck, test tasks configured
- [x] pnpm install — zero errors
- [x] pnpm build — fails on `/signin` page (useSearchParams without Suspense boundary)
  - This is a known pre-existing issue; the signin page will be removed and rebuilt in Phase 3

## Files Changed

```
apps/web/package.json          — added 6 new dependencies
apps/web/postcss.config.mjs    — created (Tailwind CSS 4 PostCSS config)
pnpm-lock.yaml                 — updated with new deps
.adr/history/1_project-init/   — created directory
```

## New Dependencies Added

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4.2.1 | CSS utility framework for pass-1 conversion |
| @tailwindcss/postcss | ^4.2.1 | PostCSS plugin for Tailwind CSS 4 |
| postcss | ^8.5.8 | CSS post-processor |
| chart.js | ^4.5.1 | Dashboard weekly activity bar chart |
| react-chartjs-2 | ^5.3.1 | React wrapper for Chart.js |
| sortablejs | ^1.15.7 | Kanban drag-and-drop |
| @types/sortablejs | ^1.15.9 | TypeScript types for SortableJS |
| roughjs | ^4.6.6 | Hand-drawn effects for schema planner + whiteboard |

## Validation Results

- pnpm install: PASS (zero errors)
- TypeScript config: VALID
- ESLint config: VALID
- Turbo config: VALID
- pnpm build: KNOWN FAILURE (signin page Suspense issue — will be fixed in Phase 3)

## Build Error (Known, Non-blocking)

```
useSearchParams() should be wrapped in a suspense boundary at page "/signin"
Error occurred prerendering page "/signin"
```

This page will be removed in Phase 3 (Frontend Cleanup) and rebuilt from the pass-1 concept.
