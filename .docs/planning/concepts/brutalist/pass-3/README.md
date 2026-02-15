# VAULTCTL — Brutalist Pass 3: Terminal/CLI CRT Aesthetic

## Concept Overview

This pass transforms the idea management app into a full terminal emulator interface inspired by retro CRT monitors and command-line tools. The entire UI looks and behaves like a command-line application running inside a phosphor-green terminal. Black background with green text, scanline overlays, blinking cursors, and keyboard-first navigation define every interaction.

**Content Persona:** Cybersecurity startup ("Vault Security Inc.")
All fake data is themed around security operations — threat detection, vulnerability scanning, incident response, MITRE ATT&CK mappings, and SOC analyst workflows.

## Design Decisions

### Shell & Layout (Uniqueness Profile: terminal-console)
- **shellMode: no-chrome-fullscreen** — The terminal occupies the entire viewport with minimal window chrome (just a title bar with traffic-light dots and PID badge)
- **navPattern: keyboard-shortcut-only** — Navigation is driven by number keys [1]-[0], always visible as labels in the sidebar. No hover effects on nav items.
- **contentFlow: terminal-output-stream** — All content renders as if being printed to stdout: monospace text, command prompts, key=value pairs, and ASCII art
- **scrollMode: auto-scroll-bottom** — Content fills from top, scroll position maintained per view
- **alignment: left** — Everything is left-aligned, matching terminal conventions
- **heroTreatment: ascii-banner** — Dashboard features a large ASCII art title rendered in FIGlet style
- **density: compact** — Tight line-height, minimal spacing, maximum information density

### Typography
- **Headings:** IBM Plex Mono — Used for section headers, labels, and the title bar
- **Body:** Share Tech Mono — Used for all content, commands, and data display
- All text rendered in monospace throughout, as befits a terminal interface

### Palette
| Token | Color | Usage |
|-------|-------|-------|
| bg | #0a0a0a | Main background (near-black) |
| text | #33ff33 | Primary text (phosphor green) |
| surface | #111111 | Card/panel backgrounds |
| accent | #00ff88 | Active states, success, prompts |
| accent2 | #ffcc00 | Section headers, warnings, highlights |
| border | #1a3a1a | All borders (dark green) |

### Anti-Repeat Compliance
- Pass 1 used paper+red palette on light background — this pass uses black+green CRT aesthetic instead
- Pass 1 used Anton display headings — this pass uses monospace for everything instead
- Pass 2 used newspaper/manifesto layout with stamps — this pass uses terminal/CLI layout instead
- Pass 2 used memo-format chat — this pass uses REPL terminal chat instead
- Pass 2 used swimlane kanban — this pass uses Eisenhower priority matrix instead

## Interaction Profile Implementation

| Interaction | Implementation |
|-------------|---------------|
| **buttonHover** | None — keyboard-driven interface, no hover effects |
| **buttonClick** | flash-green-outline: 200ms green box-shadow pulse via `.btn-flash` keyframe |
| **cardHover** | cursor-blink-indicator: Blinking green block appears left of focused row via `::before` pseudo-element |
| **pageTransition** | terminal-clear-redraw: `clip-path: inset()` animation reveals content top-to-bottom |
| **scrollReveal** | typewriter-line-print: IntersectionObserver triggers staggered fade-in per line (50ms delay per item) |
| **navItemHover** | None — keyboard shortcut labels always visible, no mouse hover effect |
| **navItemActive** | arrow-cursor-prefix: Active item shows `>` prefix, highlighted in accent color |
| **inputFocus** | blinking-cursor-prompt: CSS caret-color set to accent, border glows green |
| **toggleSwitch** | text-toggle-on-off: [ON]/[OFF] text swaps on click/Enter with data-state attribute |
| **tooltips** | man-page-popup: Right-click/long-press on nav items shows man-page style tooltip with monospace help text |
| **loadingState** | spinning-ascii-chars: Boot sequence uses rotating `| / - \` spinner character |
| **idleAmbient** | scanline-flicker: CSS repeating-linear-gradient scanlines + occasional opacity flash |
| **microFeedback** | stdout-success-message: `[OK]` / `[DONE]` message appears in footer bar and fades after 2s |

## View Implementations

1. **Dashboard** — ASCII bar charts for threat metrics, key=value system stats, ASCII sparklines for 24h traffic trends, tail-style recent alerts log
2. **Projects** — `ls -la` file listing format with columns for permissions, status, date, size, and name
3. **Project Workspace** — Tmux-style split panes: top pane shows project README/sprint data, bottom pane is interactive shell with git log and test output
4. **Kanban** — 2x2 Eisenhower priority matrix (Urgent/Not Urgent x Important/Not Important) with single-line task entries and status codes
5. **Whiteboard** — ASCII flowchart with box-drawing characters showing network security architecture and threat model
6. **Schema Planner** — CREATE TABLE SQL statements with typed columns, constraints, and indexes for a threat intelligence database
7. **Directory Tree** — `tree` command output with box-drawing branch connectors showing Go project structure
8. **Ideas** — Numbered search-result list with title, one-line summary, metadata tags, vote counts, and dates
9. **AI Chat** — Terminal REPL: user input after `$` prompt, AI responses prefixed with `=>`, no chat bubbles
10. **Settings** — INI-file format with `[SECTION]` headers and key=value pairs; [ON]/[OFF] toggles and cycling option values

## Library Usage

### Typed.js (CDN loaded)
- **Version:** 2.1.0
- **CDN:** `https://cdn.jsdelivr.net/npm/typed.js@2.1.0/dist/typed.umd.js`
- **Usage:** Included for the typing/typewriter capability, though the actual typewriter effects in this pass are implemented with custom JS for tighter control over the terminal aesthetic (boot sequence, status bar command typing). The library is available as a dependency if extended typing animations are needed.

### No Other Libraries
Pure CSS handles all other interactions — scanlines, blink cursors, page transitions, scroll reveals, and CRT flicker. The terminal aesthetic is best served by minimal dependencies, matching the brutalist philosophy of raw structural honesty.

## Responsive Behavior

- **Desktop (>768px):** Full sidebar navigation visible alongside content area
- **Mobile (<=768px):** Sidebar slides in from left via hamburger toggle button (`>` / `<`). Title bar right section and status bar details hidden. Matrix cells and ASCII art scale down.
- **Small Mobile (<=480px):** Further reduction of ASCII art font sizes, tighter padding

## File Structure

```
pass-3/
  index.html                          # Complete HTML with all 10 views
  style.css                           # Full CSS with responsive breakpoints
  app.js                              # Navigation, interactions, boot sequence
  README.md                           # This file
  validation/
    handoff.json                      # Structural metadata
    inspiration-crossreference.json   # Inspiration reference mapping
```
