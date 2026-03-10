Phase: phase_3
Session: 2_design-system-and-shell
Date: 2026-03-10
Owner: subagent
Status: complete

# Phase 3 Review — Root Layout + Landing Page

## Completed Tasks
- Updated root layout.tsx with `antialiased` on html, `bg-creamy-milk text-signal-black font-sans min-h-screen` on body
- Kept existing CSS @import for Google Fonts (Space Grotesk + IBM Plex Mono) in globals.css — simpler than next/font
- Updated landing page (/) with auth TODO comments for Session 3 (Clerk)
- Preserved existing redirect to /dashboard for unauthenticated flow
- Verified proxy.ts already handles protected route redirects (no middleware.ts needed — Next.js 16 uses proxy.ts)
- Started dev server, confirmed HTTP 307 redirect on `/` works correctly

## Files Changed
```
apps/web/src/app/layout.tsx        — Added antialiased, bg/text/font classes
apps/web/src/app/page.tsx          — Added auth TODO comments for Session 3
.adr/current/2_design-system-and-shell/phase_3_review.md — This review
```

## Validation
- Dev server starts without errors (Next.js 16.1.6 + Turbopack)
- GET / returns HTTP 307 redirect (proxy.ts routes to /signin for unauthenticated, page.tsx redirects to /dashboard)
- No middleware.ts created — proxy.ts (already present) handles the same concern in Next.js 16

## Notes
- Did NOT create middleware.ts — Next.js 16 uses proxy.ts instead and errors if both exist
- The existing proxy.ts already handles auth redirects (redirects to /signin when no session cookie)
- Font loading uses CSS @import in globals.css rather than next/font/google for simplicity
- Body styles applied via Tailwind utility classes that map to @theme design tokens
