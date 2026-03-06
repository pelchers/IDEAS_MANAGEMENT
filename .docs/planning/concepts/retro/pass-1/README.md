# Retro — Pass 1

## Overview
1970s-1980s retro computing and arcade aesthetic. CRT scan lines, phosphor green-on-black terminals, pixel-style fonts, chunky pixel borders, and neon accent colors. The interface feels like a retro operating system or early BBS. Full-bleed immersive dark background with bottom tab navigation styled as a retro command bar. Warm amber and neon accents against dark backgrounds.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#00FF41` — Phosphor green
  - Secondary: `#FF6B00` — Amber CRT
  - Accent: `#FF00FF` — Neon magenta
  - Background: `#0A0A0A` — CRT black
  - Surface: `#1A1A2E` — Dark blue-black panels
  - Text: `#00FF41` — Green terminal text
  - Scanline: `rgba(0, 0, 0, 0.15)` — CRT scanline overlay

- **Typography**:
  - Headings: Press Start 2P (400) — Google Fonts — pixel font
  - Body: VT323 (400) — Google Fonts — terminal font
  - Accent: Share Tech Mono (400) — Modern mono for data

- **Visual Elements**:
  - CRT scanline overlay effect (CSS repeating gradient)
  - Pixel-style borders and elements
  - Blinking cursor animations
  - Terminal-style command prompts
  - Neon glow effects (box-shadow with color)
  - ASCII art decorative elements
  - Retro window chrome (title bars with close/minimize)

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research retro computing and CRT terminal aesthetics in web design — phosphor green, scanline effects, pixel fonts, neon accents, vintage OS window chrome"
  - Look for: terminal interfaces, CRT effects, pixel art, retro OS windows, ASCII art
  - Avoid: clean modern design, sans-serif fonts, flat design

## Technologies
- **Typed.js** v2.1.0 — Typewriter text for terminal-style content reveals
  - CDN: `https://cdn.jsdelivr.net/npm/typed.js@2.1.0/dist/typed.umd.js`
- **Google Fonts** — Press Start 2P, VT323, Share Tech Mono
  - `https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Share+Tech+Mono&display=swap`

## Style

### Style Group: Retro
Nostalgic computing aesthetics — CRT terminals, pixel fonts, neon glows, and vintage OS chrome. The interface transports users to an earlier computing era while remaining functionally modern.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `full-bleed-immersive` | Full-screen CRT terminal experience |
| Navigation Model | `bottom-tabs` | Retro command bar at bottom |
| Information Density | `high-data-dense` | Terminal-style dense text output |
| Animation Philosophy | `continuous-ambient` | Blinking cursors, scanline animation, neon pulse |
| Color Temperature | `warm-dominant` | Amber/green phosphor glow on black |

### Subagent Uniqueness Flags
| Flag | Value | Description |
|------|-------|-------------|
| Window Chrome | `retro-os-chrome` | Every view wrapped in DOS-style window with colored close/min/max buttons and C:\path title |
| Terminal Prompts | `c-drive-path-style` | Window titles use C:\IDEA-OS\MODULE.EXE format; dashboard has typed welcome message |
| Glow Effects | `per-color-neon-glow` | Green, amber, and magenta glow variants via CSS box-shadow custom properties |
| Scanline Overlay | `css-repeating-gradient` | Full-viewport scanline overlay with toggleable flicker effect in settings |
| Chart Style | `phosphor-green-line-charts` | Chart.js charts styled with pixel fonts and phosphor-green color scheme |
| Input Style | `terminal-command-prompt` | All inputs styled as terminal prompts with blinking cursor prefix |

### Additional Technologies Used
- **Chart.js** v4.4.7 — Retro-styled dashboard charts (line + doughnut)
- **SortableJS** v1.15.6 — Drag-and-drop kanban card reordering

### Design Inspiration Sources (Discovered)
- **Poolsuite FM** — Retro OS window chrome, neon accents, bottom toolbar
- **Terminal CSS** — Monospace typography system, green-on-black scheme
- **Masswerk Virtual Terminal** — Blinking cursor, scanline effects, command prompts

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
