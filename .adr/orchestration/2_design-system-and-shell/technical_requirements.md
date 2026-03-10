# Technical Requirements — 2_design-system-and-shell

## Stack
- Tailwind CSS 4.x with custom theme
- React 19 client components for interactive shell
- Next.js App Router layout system

## Key Files
- `tailwind.config.ts` — all pass-1 design tokens
- `apps/web/src/app/globals.css` — scrollbar styling, animation keyframes, base resets
- `apps/web/src/components/shell/app-shell.tsx` — nav drawer, hamburger, overlay
- `apps/web/src/components/shell/top-bar.tsx` — fixed header with title, search, bell
- `apps/web/src/app/(authenticated)/layout.tsx` — wraps children in AppShell

## Pass-1 Reference Sections
- style.css lines 1-100: CSS custom properties (colors, spacing, shadows)
- style.css lines 100-300: navigation drawer, hamburger, overlay styles
- style.css lines 300-500: top bar, search input, notification styles
- index.html: nav element structure, link text, numbered labels
- app.js: hamburger toggle, drawer animation, overlay click handler

## Validation
- Playwright screenshots comparing pass-1 validation PNGs vs live app
- All 10 nav links route to correct pages (even if pages are empty stubs)
