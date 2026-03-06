# Bento — Pass 1

## Overview
Apple-inspired bento grid layout — modular content tiles of varying sizes arranged in a satisfying mosaic. Each view presents its content as a grid of bento boxes with rounded corners, subtle shadows, and a cool, modern palette. The persistent left rail provides clean icon navigation. High information density through smart tile sizing. Subtle micro-interactions on tile hover.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#1D1D1F` — Apple dark
  - Secondary: `#86868B` — Apple gray
  - Accent: `#0071E3` — Apple blue
  - Background: `#F5F5F7` — Apple light gray
  - Surface: `#FFFFFF` — White bento tiles
  - Text: `#1D1D1F` — Dark text
  - Tile-hover: `#F0F0F2` — Subtle hover state

- **Typography**:
  - Headings: SF Pro Display / system-ui (600, 700) — Apple system font
  - Body: SF Pro Text / system-ui (400) — Apple body font
  - Mono: SF Mono / ui-monospace (400) — System mono

- **Visual Elements**:
  - Modular bento grid tiles (various sizes: 1x1, 2x1, 1x2, 2x2)
  - Generous rounded corners (16-20px)
  - Subtle elevation shadows (`0 2px 8px rgba(0,0,0,0.08)`)
  - Clean tile borders with slight separation gap (8px)
  - Glassmorphism accent on select tiles (backdrop-filter: blur)
  - Gradient fills on feature tiles

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research Apple bento grid layouts and modular tile-based dashboard designs — rounded containers, cool neutral palettes, varying tile sizes, subtle shadows"
  - Look for: modular grids, bento boxes, Apple-style rounded tiles, cool minimalism
  - Avoid: sharp corners, heavy borders, warm palettes, editorial typography

### Adapted References
- **Apple HIG** — System font stack, generous corner radii (16-20px), cool neutral palette with blue accent, subtle elevation shadows
- **Apple Keynote Bento Grids** — Variably-sized tile mosaic grid, gradient fills on hero stat tiles, selective glassmorphism, high density through tile sizing strategy

## Technologies
- **GSAP** v3.12.5 — Tile hover micro-interactions (subtle scale, shadow shift)
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Chart.js** v4.4.7 — Small charts inside bento stat tiles
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **System Fonts** — SF Pro Display/Text, system-ui (no Google Fonts needed)

## Style

### Style Group: Bento
Modular tile-based layout inspired by Apple's bento grid keynote presentations. Content is organized into variably-sized rounded tiles that create a satisfying visual mosaic. Clean, modern, and information-dense without feeling cluttered.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `dashboard-grid` | Core bento grid of variably-sized tiles |
| Navigation Model | `persistent-left-rail` | Clean icon rail — Apple-style minimal nav |
| Information Density | `high-data-dense` | Dense but organized through tile sizing |
| Animation Philosophy | `subtle-micro-interactions` | Tile hover scale, shadow shift, content reveal |
| Color Temperature | `cool-dominant` | Apple blue accent on neutral gray base |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Tile Grid Variation | `auto-flow-explicit-spans` | CSS Grid with explicit span classes (1x1, 2x1, 1x2, 2x2, 3x2) for each view's unique mosaic |
| Chart Integration | `embedded-stat-tiles` | Chart.js line + doughnut rendered inside bento tiles, not standalone |
| Interactive Elements | `editor-tree-chat-tools` | Contenteditable editor, collapsible file tree, live chat input, whiteboard tool switching |
| Mobile Nav Pattern | `bottom-bar-overflow-sheet` | 5-item bottom tab bar with overflow "More" menu as a slide-up sheet overlay |
| Glassmorphism Usage | `selective-single-tile` | backdrop-filter blur applied only to the Quick Actions tile for subtle depth |
| View Transition | `gsap-stagger-fade-up` | Tiles animate in with staggered fade-up on view switch via GSAP |

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets (6 projects, 12 kanban cards, 8 ideas, 6 chat messages, 10 activity items).
