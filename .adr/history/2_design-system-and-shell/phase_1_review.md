# Phase 1 Review — Tailwind Config + Global CSS from Pass-1

Session: 2_design-system-and-shell
Phase: 1
Date: 2026-03-10
Status: complete

## Summary

Converted the entire pass-1 brutalism-neobrutalism style.css (1892 lines) into a
Tailwind CSS 4 design system using `@theme` directive in globals.css. All design
tokens (colors, fonts, shadows, spacing, animations) are faithfully reproduced.
Component classes (.nb-card, .nb-btn, .nb-input, .nb-badge, .nb-tab, .nb-toggle)
provide reusable brutalist patterns matching pass-1 exactly.

## Tasks Completed

- [x] Read pass-1 style.css completely (1892 lines)
- [x] Extracted all CSS custom properties (colors, spacing, shadows, borders, transitions, layout)
- [x] Configured Tailwind CSS 4 via @theme directive (not tailwind.config.ts — Tailwind 4 uses CSS-based config)
- [x] Registered colors: signal-black (#282828), creamy-milk (#F8F3EC), watermelon (#FF5E54), malachite (#2BBF5D), cornflower (#1283EB), lemon (#FFE459), amethyst (#7B61FF), white, surface, gray-dark (#3a3a3a), gray-mid (#666666), watermelon-dark (#D94A42)
- [x] Registered fonts: Space Grotesk (sans), IBM Plex Mono (mono)
- [x] Registered shadows: nb-sm (2px 2px 0px), nb (4px 4px 0px), nb-lg (6px 6px 0px), nb-xl (7px 7px 0px), nb-kanban (3px 3px 0px), nb-kanban-hover (5px 5px 0px)
- [x] Registered custom spacing tokens (xs/sm/md/lg/xl/2xl, topbar, drawer)
- [x] Registered animation keyframes: view-slam, slam-in (cubic-bezier(0.2, 0, 0, 1))
- [x] Added Google Fonts import (Space Grotesk 400/500/700, IBM Plex Mono 400/600)
- [x] Added custom scrollbar styling (14px wide, signal-black track, watermelon thumb hover)
- [x] Added Firefox scrollbar support (scrollbar-width/scrollbar-color)
- [x] Added typography base styles (headings: uppercase, 700 weight, -0.02em tracking)
- [x] Added reduced motion media query
- [x] Created .nb-card component (thick border, white bg, hard shadow, hover lift)
- [x] Created .nb-btn component (thick border, hard shadow, hover/active transforms, primary/danger/small variants)
- [x] Created .nb-input component (thick border, monospace placeholder, focus shadow)
- [x] Created .nb-badge component (small text, uppercase, colored bg, 8 status variants)
- [x] Created .nb-tab component (brutalist tab with active state)
- [x] Created .nb-toggle component (brutalist toggle switch)
- [x] Created .nb-view-title and .nb-view-subtitle utilities
- [x] Added mobile responsive spacing override (< 480px)
- [x] Added :root custom properties for border/transition shorthands
- [x] Verified dev server compilation: PASS (no errors)
- [x] Verified page loads with correct CSS: PASS
- [x] Verified design tokens in generated CSS output: PASS (57 token references found)
- [x] Verified fonts registered as Tailwind defaults: PASS
- [x] Stopped dev server: PASS

## Files Modified

```
apps/web/src/app/globals.css — Complete rewrite with Tailwind 4 @theme design system
```

## Design Tokens Created

### Colors (Tailwind utilities: bg-{name}, text-{name}, border-{name})
| Token | Value | Usage |
|-------|-------|-------|
| signal-black | #282828 | Primary text, borders, shadows |
| creamy-milk | #F8F3EC | Background |
| watermelon | #FF5E54 | Accent, warnings, CTA |
| malachite | #2BBF5D | Success, active states |
| cornflower | #1283EB | Links, info badges |
| lemon | #FFE459 | Highlights, medium priority |
| amethyst | #7B61FF | Purple accents, bugs |
| surface | #FFFFFF | Card/surface backgrounds |
| gray-dark | #3a3a3a | Dark gray text |
| gray-mid | #666666 | Secondary text |
| watermelon-dark | #D94A42 | Hover state for watermelon |

### Shadows (Tailwind utilities: shadow-{name})
| Token | Value |
|-------|-------|
| nb-sm | 2px 2px 0px #282828 |
| nb | 4px 4px 0px #282828 |
| nb-lg | 6px 6px 0px #282828 |
| nb-xl | 7px 7px 0px #282828 |
| nb-kanban | 3px 3px 0px #282828 |
| nb-kanban-hover | 5px 5px 0px #282828 |

### Fonts
| Token | Value |
|-------|-------|
| sans | 'Space Grotesk', system-ui, sans-serif |
| mono | 'IBM Plex Mono', 'Courier New', monospace |

### Animations
| Token | Value |
|-------|-------|
| view-slam | 0.3s cubic-bezier(0.2, 0, 0, 1) translateY |
| slam-in | 0.3s cubic-bezier(0.2, 0, 0, 1) translateX |

## Validation Results

- Tailwind 4 compilation: PASS
- Google Fonts import: PASS (loads before tailwindcss import)
- Color tokens registered: PASS (11 colors)
- Shadow tokens registered: PASS (6 shadows)
- Font tokens registered: PASS (sans + mono)
- Animation keyframes: PASS (2 animations)
- Scrollbar styling: PASS (webkit + firefox)
- Component classes: PASS (6 components)
- Dev server: started, verified, stopped cleanly

## Notes

- Tailwind CSS 4.2.1 uses CSS-based configuration (`@theme` in globals.css), NOT `tailwind.config.ts`
- The `@import url(...)` for Google Fonts MUST precede `@import "tailwindcss"` to avoid CSS parse errors
- Color tokens are JIT-compiled — they appear in output CSS only when used in Tailwind utility classes
- Border shorthand tokens (--border-thick, --border-thicker) are in :root since @theme doesn't support shorthand properties
