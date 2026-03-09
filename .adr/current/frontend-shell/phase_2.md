# Phase 2: App Shell + Navigation

Session: frontend-shell
Phase: 2
Date: 2026-03-07

## Prior Phase Summary
Phase 1 completed: Full design system transfer from pass-1. globals.css rewritten to 3045 lines covering all tokens, components, layouts, animations. Fonts verified. Commit: d955128.

## Objective
Build the app shell (hamburger drawer/sidebar, top bar, main content area) as a shared layout component matching the pass-1 concept exactly. Wire up navigation and signout.

## Tasks
1. Read the pass-1 concept HTML structure for the app shell:
   - Hamburger button with open/close animation
   - Navigation drawer (sidebar) with logo, nav links, user info footer
   - Top bar with breadcrumb, search, notifications
   - Main content area
2. Create an AppShell component that wraps all authenticated pages:
   - Either in layout.tsx (for /dashboard and /projects/* routes)
   - Or as a shared component imported by authenticated layouts
3. Build the hamburger drawer / sidebar:
   - Logo/brand at top
   - Navigation links: Dashboard, Projects (with project list), AI Chat, Settings
   - User info and signout button at bottom
   - Slide-in/out animation on mobile
   - Always visible on desktop (>1024px)
4. Build the top bar:
   - Hamburger toggle button (mobile)
   - Breadcrumb navigation showing current location
   - Search input (can be non-functional placeholder for now)
   - Notification bell (placeholder)
   - User avatar/name
5. Implement responsive behavior:
   - Desktop: sidebar always visible, content shifts right
   - Tablet/Mobile: sidebar hidden, hamburger button shows, overlay when open
6. Wire navigation links to Next.js routes using Link or useRouter
7. Wire signout button to POST /api/auth/signout, redirect to /signin on success
8. Fetch current user info via GET /api/auth/me for the sidebar user section

## Design Reference
The pass-1 CSS already has all the classes needed:
- `.hamburger`, `.hamburger.open` — toggle button
- `.nav-drawer`, `.nav-drawer.open` — sidebar
- `.nav-drawer-header` — logo section
- `.nav-drawer-links` — navigation items
- `.nav-drawer-footer` — user info
- `.nav-overlay` — background overlay
- `.top-bar` — top bar
- `.top-bar-crumb` — breadcrumb
- `.main-content` — content area

## Validation
- Playwright screenshots at desktop (1536x960) and mobile (390x844)
- Shell renders correctly with sidebar, top bar, content area
- Navigation links work
- Signout works
- Responsive behavior correct at all breakpoints
- Report: `.docs/validation/frontend-shell/phase_2/user-story-report.md`

## Output
- New/modified layout components
- `.adr/history/frontend-shell/phase_2_review.md`
- `.docs/validation/frontend-shell/phase_2/user-story-report.md`
- Updated primary task list
