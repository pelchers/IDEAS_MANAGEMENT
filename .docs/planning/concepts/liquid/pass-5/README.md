# VOIDFREQUENCY — Liquid Motion Pass 5

## Concept Overview

**Style:** Neon Plasma Electric
**Content Persona:** Electronic Music Label
**Variant Seed:** neon-plasma-electric

This pass channels an electronic music visualizer aesthetic — electric cyan and magenta plasma tendrils pulse on a deep indigo void. The UI metaphor transforms idea management into a music production and label management experience: dashboards become frequency spectrum analyzers, projects become release rosters, kanban boards become playlist queues, and settings become mixing console channel strips.

## Design Decisions

### Layout Architecture
- **Navigation:** Top-fixed horizontal tab bar styled as protruding stone tablets — each tab protrudes upward with an equalizer bar indicator for the active state
- **Content Flow:** Center-aligned depth-stacked layers with dense content panels
- **Density:** Dense — maximizing information display per screen real estate, inspired by music production DAW interfaces

### Typography
- **Headings:** Syncopate — geometric, bold, uppercase with wide letter-spacing for that synth-display readout feel
- **Body:** Lexend — highly legible, designed for reading speed, providing contrast against the display-oriented heading font
- **Monospace:** Fira Code — used for metadata, timestamps, technical values (BPM, keys, file sizes)

### Color Palette
- `#0c0820` — Deep indigo void background
- `#e0e8ff` — Cool white text with subtle blue warmth
- `#141030` — Slightly lifted surface for panels
- `#00e5ff` — Electric cyan primary accent
- `#ff00aa` — Hot magenta secondary accent
- `#2a1e4a` — Muted purple borders

### Interaction Design
| Interaction | Implementation |
|---|---|
| Button Hover | Plasma tendril gradient wraps around button perimeter via animated background-size |
| Button Click | Bass-drop shockwave — concentric pulse ring + scale micro-bounce |
| Card Hover | Waveform border pulse — box-shadow intensity shifts with cursor X position |
| Page Transition | Glitch distortion swap — scanline overlay + RGB text separation for 350ms |
| Scroll Reveal | Frequency sweep materialize — horizontal scanline noise fading to clarity |
| Nav Hover | Beat pulse highlight — opacity/scale oscillation at BPM-like rhythm |
| Nav Active | Equalizer bar indicator — 4 bars bouncing at different frequencies |
| Input Focus | Plasma arc border — animated box-shadow cycling with electric glow |
| Toggle Switch | Power surge toggle — overcharge flash on state change |
| Tooltips | Hologram popup — scanline-textured tooltip with glitch entrance |
| Loading State | Equalizer loading bars — 8 bars bouncing at different delays |
| Idle Ambient | Beat-pulse on background panels — slow border-color breathing |
| Micro Feedback | DROP! flash — cyan edge flash with text stamp on success |

## View Descriptions

1. **Dashboard (Command Center):** 4 metric cards with live waveform canvases, frequency spectrum bar chart, and signal log activity feed
2. **Releases (Projects):** Track-list layout with waveform previews, BPM/key/genre badges, status indicators
3. **DJ Deck (Project Workspace):** Dual-deck layout with turntable animations, crossfader, task summary, and production notes
4. **Queue (Kanban):** 4-column board (Queue/Now Playing/Mixed/Archived) with track cards featuring waveform thumbnails
5. **Patch Bay (Whiteboard):** Modular synth canvas with draggable modules, knobs, sliders, patch cable SVG connections
6. **Signal Flow (Schema Planner):** Audio processing block diagram with animated signal-path lines and entity metadata
7. **Sample Library (Directory Tree):** Hierarchical file browser with genre folders, file metadata, and waveform preview panel
8. **Vinyl Vault (Ideas):** Record shelf metaphor — ideas as vinyl records with gradient cover art and expandable sleeves
9. **Voice Memo AI (Chat):** Audio-message-style chat with waveform visualizations, play controls, and transcripts
10. **Mixing Console (Settings):** Channel strip layout with faders, toggles, color swatches, and integration rows

## Libraries Used

1. **GSAP 3.12.5** — Complex animation timelines, stagger sequences, cable/signal line animation
2. **GSAP ScrollTrigger** — Scroll-driven animation coordination (registered but primarily using custom scroll reveal for the frequency-sweep effect)

## Anti-Repeat Compliance
- Pass 1 used blue-purple blob morphing on light — this pass uses deep indigo with cyan+magenta plasma energy
- Pass 2 used ocean wave water motion — this pass uses audio waveform and equalizer motion
- Pass 3 used chrome/mercury metallic on charcoal — this pass uses neon plasma on deep indigo
- Pass 4 used soft pastel watercolor on white — this pass uses intense neon electronic on black

## Inspiration References Applied
- **Ableton:** Modular rack-unit card layout — each content block is self-contained with header/content/controls
- **Native Instruments:** Deep teal-on-midnight color scheme, geometric sans-serif at distinct weights for instrument-panel precision
- **Splice:** Dark-mode-first with inline waveform visualizations, neon accents for interactive states
