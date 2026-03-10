# Primary Task List — 2_design-system-and-shell

Session: Design System and App Shell
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/style.css`

---

## Phase 1 — Tailwind Config + Global CSS from Pass-1

- [ ] Read pass-1 `style.css` completely (1892 lines)
- [ ] Extract all CSS custom properties into Tailwind config (colors, spacing, shadows, borders)
- [ ] Convert pass-1 color palette to Tailwind: signal-black (#282828), creamy-milk (#F8F3EC), watermelon (#FF5E54), malachite (#2BBF5D), cornflower (#1283EB), lemon (#FFE459), amethyst (#7B61FF)
- [ ] Configure Space Grotesk (400/500/700) and IBM Plex Mono (400/600) in Tailwind
- [ ] Convert pass-1 border utilities (3-4px solid black) to Tailwind components
- [ ] Convert pass-1 shadow utilities (4px/6px/2px hard drop shadows) to Tailwind
- [ ] Convert pass-1 scrollbar styling (14px thick, watermelon hover, black thumbs) to globals.css
- [ ] Convert pass-1 responsive breakpoints to Tailwind screens
- [ ] Convert pass-1 animation keyframes (slam, hover transforms) to Tailwind
- [ ] Verify visual parity: globals.css + tailwind.config produces same visual output as pass-1 style.css

## Phase 2 — App Shell (Navigation + Layout)

- [ ] Read pass-1 `index.html` navigation structure (hamburger, drawer, overlay, numbered nav links 01-10)
- [ ] Build AppShell React component matching pass-1 exactly:
  - Hamburger button (top-left, 48x48, 3px thick lines)
  - Slide-out navigation drawer (280px wide, slam animation cubic-bezier(0.2,0,0,1))
  - Semi-transparent overlay behind drawer
  - 10 numbered nav links (01 Dashboard through 10 Settings) in uppercase
  - User profile section in drawer footer (avatar circle with initials)
  - Close on overlay click, close on Escape key
- [ ] Build TopBar component matching pass-1:
  - Fixed 60px header with view title (all caps)
  - Search input (monospace placeholder)
  - Notification bell with status indicator
  - 4px black border-bottom
- [ ] Build (authenticated) layout wrapping children in AppShell
- [ ] Verify: nav drawer opens/closes with slam animation, all 10 links route correctly

## Phase 3 — Root Layout + Landing Page

- [ ] Configure root layout.tsx with Space Grotesk + IBM Plex Mono font imports
- [ ] Create landing page (/) with redirect to /dashboard for authenticated users
- [ ] Ensure unauthenticated users see signin page
- [ ] Verify responsive behavior matches pass-1 (mobile drawer, desktop sidebar if applicable)
