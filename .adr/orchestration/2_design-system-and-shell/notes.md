# Notes — 2_design-system-and-shell

## Decisions
- D1: Use Tailwind config for design tokens rather than CSS custom properties alone — enables utility-first workflow for all subsequent sessions
- D2: Keep slam animation as CSS keyframe in globals.css (Tailwind animate plugin for custom animations)
- D3: AppShell is a client component (needs useState for drawer open/close)

## Constraints
- C1: Must match pass-1 navigation exactly — 10 numbered links, same order, same uppercase style
- C2: Drawer width must be exactly 280px with same animation timing

## Design Fidelity
- Mode: FAITHFUL
- Subagent instruction: "Read pass-1 style.css and index.html nav section. Your React components must reproduce this layout exactly. Same elements, hierarchy, interactions, hover effects."
