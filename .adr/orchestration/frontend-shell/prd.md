# Product Requirements (Session Reference)

Session: frontend-shell

Full PRD: `.docs/planning/prd.md`
Design Concept: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/`
Technical Spec: `.docs/planning/technical-specification.md`

## Scope

Strip the current frontend and rebuild the app shell, navigation, auth pages, and dashboard from scratch using the neo-brutalism pass-1 concept as the exact design reference. Every pixel should match pass-1: layout structures, typography, colors, borders, shadows, animations, and interactions.

## Design Reference

The pass-1 concept contains:
- `index.html` (556 lines) — Full app layout with hamburger drawer, top bar, view switching
- `styles.css` (1892 lines) — Complete neo-brutalism design system
- `script.js` (687 lines) — Interactions, drawer toggle, view switching, animations

## Key Design Tokens
- Signal Black: #282828
- Creamy Milk: #F8F3EC
- Watermelon: #FF5E54
- Malachite: #2BBF5D
- Cornflower: #1283EB
- Lemon: #FFE459
- Amethyst: #7B61FF
- Fonts: Space Grotesk (body), IBM Plex Mono (code/labels)
- Borders: 3-4px solid black
- Shadows: 4px 4px 0px (hard, no blur)
- Border radius: 0 (zero everywhere)
