# Technical Requirements

Session: frontend-shell

## Stack
- Next.js 16 (App Router) with TypeScript
- CSS (globals.css) — no Tailwind for core design system
- Space Grotesk + IBM Plex Mono via next/font/google
- React client components for interactive elements

## Design Source
- Pass-1 concept: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/`
- This is plain HTML/CSS/JS that must be translated to Next.js App Router pages

## File Structure
- `apps/web/src/app/layout.tsx` — Root layout with fonts, shell wrapper
- `apps/web/src/app/globals.css` — Full design system (target: ~1800+ lines)
- `apps/web/src/app/signin/page.tsx` — Sign in page
- `apps/web/src/app/signup/page.tsx` — Sign up page
- `apps/web/src/app/dashboard/page.tsx` — Dashboard / project list

## Validation
- Playwright screenshots at desktop (1536x960) and mobile (390x844 @2x)
- Visual comparison against pass-1 concept screenshots
- Auth flow tested end-to-end against live dev server
