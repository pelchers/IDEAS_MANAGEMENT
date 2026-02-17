# Slate Pass 8 — Terminal Mine Shaft

**Variant Seed**: terminal-mine-shaft
**Style**: Fullscreen terminal UI through a mining/geological lens. No visible chrome. Keyboard-first navigation. Dense information-rich output stream.
**Generated**: 2026-02-16

## Overview

The entire interface is a fullscreen terminal emulator themed as a mine shaft control system. There is no sidebar, no tab bar, no traditional GUI chrome. Navigation is achieved through keyboard shortcuts (1-0) displayed in a compact command bar at the top. Content renders as terminal output — each view is a command response that types into the main area.

An ASCII art banner greets the user at the top. The content persona is a mine foreman issuing commands and receiving readouts. Amber text on near-black slate creates the feeling of descending into a mineral mine where the rock face IS the interface.

## Structural Uniqueness

| Aspect | This Pass |
|---|---|
| Navigation | Keyboard shortcut bar with numbered key badges (no sidebar, no tabs, no hamburger) |
| Shell | Fullscreen terminal — no chrome, no panels, no split layout |
| Layout | Single continuous output stream, all content left-aligned |
| Hero | ASCII art banner (not a card, not a gradient, not an image) |
| Content flow | Terminal output stream — commands echo at top, results render below |
| Depth model | Flat — no shadows, no elevation, no layering |
| Motion | Typewriter cascade — content appears line by line |
| Density | Compact, monospace-heavy, information-dense |

## Design Characteristics

- **Palette**: Near-black (#0f0e0c), amber (#d4943a), sage green (#5a8a6a), warm tan (#c8b890)
- **Typography**: Cinzel Decorative (section headers), Source Code Pro (body), Fira Code (data/mono)
- **Depth**: Flat — minimal borders, no box-shadows, no elevation
- **Motion**: Typewriter cascade on view switch, blinking cursor idle state
- **Corners**: 0px border-radius throughout (sharp terminal edges)
- **Density**: Compact, tight line-height, monospace grid alignment

## Interaction Profile

| Category | Implementation |
|---|---|
| buttonHover | Amber text brightens, underline appears character by character (CSS ::after width transition) |
| buttonClick | Brief spark flash — amber background flashes and fades (spark keyframe animation) |
| cardHover | Amber border illuminates card edges with subtle amber box-shadow |
| pageTransition | Typewriter cascade — old view hides, new view content appears line by line |
| scrollReveal | Content lines appear sequentially with slight left-to-right slide |
| navItemHover | Key badge gets amber glow (box-shadow) |
| navItemActive | Full amber background on key badge, amber text and border |
| inputFocus | Border-bottom turns amber, blinking caret in accent color |
| toggleSwitch | Text toggles between [ON] and [OFF] with amber/dim color swap |
| tooltips | Inline help text in dimmer color (title attributes) |
| loadingState | Animated ellipsis "..." via CSS keyframe animation |
| idleAmbient | Blinking underscore cursor at bottom of terminal |
| microFeedback | "[OK]" text briefly appears in green-amber on success, then fades out |

## Content Persona: Mine Foreman

All views themed as mine shaft operations:
- Dashboard shows mine status report with operational metrics and activity log
- Projects are listed in a registry table with status codes
- Workspace displays project assay reports with shaft navigation
- Kanban board shows cards with priority levels and assignment
- Whiteboard is an architecture map with connection lines
- Schema planner shows entity blocks with PK/FK badges
- Directory tree uses `tree` command output format
- Ideas capture uses terminal form with prompt markers
- AI chat uses foreman/AI-assist call signs with tool action commands
- Settings are system configuration with toggle switches

## Views (10)

1. **Dashboard** — Mine status report: stats grid, activity log, quick actions
2. **Projects** — Registry table with searchable project list, status badges
3. **Project Workspace** — Split view: shaft navigation + assay report with metadata
4. **Kanban** — 4-column board with terminal-styled cards (Backlog/In Progress/Review/Done)
5. **Whiteboard** — Architecture map canvas with positioned nodes and SVG connection lines
6. **Schema Planner** — Entity blocks with field lists, PK/FK badges, relationship notation
7. **Directory Tree** — Expandable `tree` output with folder/file indicators
8. **Ideas** — Terminal capture form + chronological idea list with priority/status
9. **AI Chat** — Foreman/AI-assist conversation with tool action execution blocks
10. **Settings** — System configuration: Account, Subscription, Preferences, Integrations, Data

## No External Libraries

Pure HTML/CSS/JS. No animation libraries, no drag-and-drop libraries, no tooltip libraries.

## Anti-Repeat Compliance

- Pass 1 used recessed left rail with etched panels — this pass has NO sidebar, fullscreen terminal
- Pass 2 used protruding top tablets with geological strata — this pass has NO tabs, flat terminal
- Pass 3 used obsidian glass with ember glow — this pass uses matte amber on dark slate, no glass
- Pass 4 used sandstone canyon desert — this pass uses dark mine shaft interior
- Pass 5 used marble temple with polished columns — this pass uses raw terminal aesthetics
- Pass 6 used military bunker with tactical overlays — this pass uses mining terminal, no military theme

## Responsive Behavior

- **Desktop (1536px+)**: Full terminal with 6-column stat grid, ASCII art at full size
- **Tablet (768-1023px)**: 2-column stats, 2-column kanban, workspace stacks vertically
- **Mobile (390px)**: Nav keys become 5x2 clickable grid, single-column everything, compact ASCII art, status bar simplified. All views remain fully navigable via tap since keyboard shortcuts are not available on mobile.
