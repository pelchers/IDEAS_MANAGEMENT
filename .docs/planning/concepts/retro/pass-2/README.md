# Retro — Pass 2

## Overview
1950s-1960s mid-century retro — atomic age, googie architecture, and space age optimism. Pastel palette with coral, mint, and cream. Boomerang shapes, atomic starbursts, and streamlined curves. The sidebar navigation feels like a vintage jukebox menu. Hover effects expand elements with springy, playful motion. Cool-toned with mint and sky blue accents.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#FF6B6B` — Coral/salmon
  - Secondary: `#4ECDC4` — Mint/teal
  - Accent: `#FFE66D` — Sunny yellow
  - Background: `#FFF8F0` — Warm cream
  - Surface: `#FFFFFF` — White
  - Text: `#2C3E50` — Dark slate
  - Retro: `#95E1D3` — Light mint for accents

- **Typography**:
  - Headings: Righteous (400) — Google Fonts — retro display
  - Body: Quicksand (400, 500) — Rounded, friendly
  - Accent: Pacifico (400) — Script for decorative labels

- **Visual Elements**:
  - Boomerang and atomic starburst shapes (SVG/CSS)
  - Streamlined curves and rounded corners (16px+)
  - Pastel color blocks with dark outlines
  - Googie-inspired angular elements
  - Retro badge/label styling
  - Atomic-era decorative elements (starbursts, kidney shapes)

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research 1950s-60s mid-century modern and googie architecture in web design — pastel palettes, atomic starbursts, boomerang shapes, streamlined curves, space-age optimism"
  - Look for: retro pastels, atomic-age patterns, googie curves, vintage badges
  - Avoid: dark themes, CRT effects, pixel fonts, terminal aesthetics

## Technologies
- **GSAP** v3.12.5 — Springy hover-expand effects and playful motion
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Google Fonts** — Righteous, Quicksand, Pacifico
  - `https://fonts.googleapis.com/css2?family=Righteous&family=Quicksand:wght@400;500&family=Pacifico&display=swap`

## Style

### Style Group: Retro
This pass takes the 1950s-60s mid-century direction — atomic age optimism with pastel palettes, googie curves, and space-age decorative elements. Playful, warm, and nostalgic.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `sidebar-driven` | Vintage jukebox-style sidebar menu |
| Navigation Model | `hamburger-drawer` | Retro sliding drawer with atomic decorations |
| Information Density | `low-whitespace-generous` | Spacious, optimistic layouts |
| Animation Philosophy | `hover-expand-transform` | Springy, playful hover effects |
| Color Temperature | `cool-dominant` | Mint/teal accents with coral pops |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Decorative Motif | `atomic-starburst-boomerang` | Atomic starburst SVG logo with CSS rotation; boomerang corner accents on cards |
| Card Style | `pastel-bordered-rounded` | 3px bordered cards with 24px radius, pastel header sections, and gradient accents |
| Hover Behavior | `elastic-springy-gsap` | GSAP elastic.out easing for all card/button hover states with slight rotation |
| Nav Feel | `jukebox-sidebar-sliding-drawer` | Full-height sidebar with expanding circular bg on hover, sliding drawer on mobile |
| Chart Style | `rounded-bar-dual-dataset` | Chart.js dual-color rounded bar chart for weekly activity |
| Interaction Model | `drag-sortable-kanban` | SortableJS-powered cross-column drag-and-drop with live count updates |
| Form Elements | `retro-pill-toggles` | Pill-shaped radio groups, custom toggle sliders with teal active states |
| Whiteboard Style | `dot-grid-sticky-notes` | Dot-grid background with pastel sticky notes and geometric shapes |

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
