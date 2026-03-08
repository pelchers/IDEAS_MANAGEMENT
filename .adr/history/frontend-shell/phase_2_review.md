# Phase 2 Review: App Shell + Navigation

Session: frontend-shell
Phase: 2
Date: 2026-03-07
Status: COMPLETE

## Objective
Build the app shell (hamburger drawer/sidebar, top bar, main content area) as a shared layout component matching the pass-1 concept. Wire up navigation, signout, and responsive behavior.

## Architecture Decision
**Option A selected**: Route group `(authenticated)` with a shared layout.

Rationale: Next.js App Router route groups are the idiomatic way to share layout across related routes without affecting the URL. This cleanly separates authenticated pages from public pages (signin, signup) without any conditional rendering logic.

## What Was Done

### 1. Route Group Restructure
Moved authenticated page directories into `(authenticated)` route group:
- `app/dashboard/` -> `app/(authenticated)/dashboard/`
- `app/ai/` -> `app/(authenticated)/ai/`
- `app/projects/` -> `app/(authenticated)/projects/`
- Created `app/(authenticated)/settings/page.tsx` (placeholder)
- Created `app/(authenticated)/projects/page.tsx` (redirect to /dashboard)

### 2. AppShell Component
Created `src/components/shell/app-shell.tsx` — a "use client" component matching pass-1 exactly:
- **Hamburger button**: Fixed position, 3-line toggle with CSS animation to X shape
- **Nav drawer**: Logo, 4 nav links (Dashboard, Projects, AI Chat, Settings), user info footer, sign-out button
- **Nav overlay**: Click-to-close backdrop
- **Top bar**: Dynamic breadcrumb, search input (placeholder), notification bell (placeholder)
- **Active link detection**: Uses `usePathname()` to highlight current route
- **User info**: Fetches `GET /api/auth/me` on mount, displays initials, email username, and role
- **Sign-out**: POST to `/api/auth/signout`, redirects to `/signin`
- **Keyboard**: Escape key closes drawer
- **Route change**: Drawer auto-closes on navigation

### 3. Authenticated Layout
Created `app/(authenticated)/layout.tsx` — imports and renders `<AppShell>` around children.

### 4. Desktop Responsive CSS
Added `@media (min-width: 1025px)` rules to globals.css:
- Hamburger hidden
- Nav drawer always visible (no transform)
- Close button hidden
- Overlay hidden
- Top bar shifted right by drawer width
- Main content shifted right by drawer width

Also added `.app-container`, `.page-content`, and `.nav-signout-btn` utility classes.

## Files Changed
1. `apps/web/src/app/globals.css` — Added desktop responsive rules + shell utility classes (+45 lines)

## Files Created
1. `apps/web/src/components/shell/app-shell.tsx` — AppShell client component (210 lines)
2. `apps/web/src/app/(authenticated)/layout.tsx` — Authenticated route group layout
3. `apps/web/src/app/(authenticated)/settings/page.tsx` — Settings placeholder page
4. `apps/web/src/app/(authenticated)/projects/page.tsx` — Projects index redirect

## Files Moved
1. `apps/web/src/app/dashboard/` -> `apps/web/src/app/(authenticated)/dashboard/`
2. `apps/web/src/app/ai/` -> `apps/web/src/app/(authenticated)/ai/`
3. `apps/web/src/app/projects/` -> `apps/web/src/app/(authenticated)/projects/`

## Metrics
- **AppShell component**: 210 lines
- **New CSS rules**: 45 lines added to globals.css (now 3091 lines)
- **Routes tested**: 5 (dashboard, ai, settings, projects, signin)
- **Compilation errors**: 0
- **Shell elements verified**: 11 distinct CSS classes confirmed in HTML output

## Risk Assessment
- Low risk: No existing functionality broken — pages moved into route group retain same URL paths
- The `proxy.ts` middleware continues to work unchanged (checks cookie presence, redirects to /signin)
- All API routes unchanged and accessible

## Next Phase
Phase 3: Auth Pages — Rebuild signin/signup pages matching pass-1 styling exactly.
