Phase: phase_3
Session: 2_design-system-and-shell
Date: 2026-03-10
Owner: orchestrator
Status: planned

# Phase 3 — Root Layout + Landing Page

## Objectives
Configure root layout with proper font imports, create a landing page with auth
redirect logic, and verify responsive behavior matches pass-1.

## Tasks
- [ ] Update root layout.tsx with Space Grotesk + IBM Plex Mono Google Fonts imports
- [ ] Set html/body classes for creamy-milk background, signal-black text, Space Grotesk font
- [ ] Create landing page (/) that redirects authenticated users to /dashboard
- [ ] Ensure unauthenticated users hitting protected routes get redirected to /signin
- [ ] Verify responsive behavior: mobile drawer behavior, topbar collapse
- [ ] Take Playwright screenshots of shell (desktop + mobile) for validation
- [ ] Compare shell screenshots against pass-1 validation PNGs
- [ ] Start dev server, test navigation flow, then stop server

## Deliverables
- Root layout with fonts configured
- Landing page with redirect logic
- Playwright validation screenshots
- Visual comparison against pass-1

## Validation Checklist
- [ ] Fonts load correctly (Space Grotesk + IBM Plex Mono)
- [ ] Background color is creamy-milk
- [ ] Auth redirect works
- [ ] Shell matches pass-1 screenshots
- [ ] Phase review created
- [ ] Committed and pushed
