# Liquid Pass 8 — Split-Pane Aquarium

## Concept Summary
A split-pane workspace layout inspired by marine research station control panels. The interface presents a dual-pane architecture where the left pane serves as navigation/lists and the right pane displays detail content. Between panes, liquid separator lines pulse with subtle bioluminescent energy. The color palette anchors on deep teal and cyan with pink-coral bioluminescent accents.

## Variant Seed
**split-pane-aquarium** — Looking into an aquarium from a control station. Hard engineering meets fluid natural systems.

## Structural Decisions

### Shell & Navigation
- **Top toolbar** with icon+label button navigation (no sidebar, no hamburger overlay)
- Toolbar is a single 46px-tall bar with all 10 view buttons horizontally laid out
- On mobile, a hamburger toggle reveals a wrapped toolbar row below the header
- Navigation uses `data-target` attributes, not anchor links

### Content Flow
- **Resizable split panes** — most views use a left/right split layout
- Pane dividers are draggable on desktop, allowing users to resize the left panel
- Each pane has its own scroll region (independent scrolling)
- Kanban and Whiteboard views use a single full-width pane to maximize space

### Layout Specifics
- Dashboard: left = stats/quick-actions, right = activity feed
- Projects: left = project list, right = project detail
- Workspace: left narrow nav + metadata, right overview cards
- Kanban: full-width 4-column horizontal scroll
- Whiteboard: full-width canvas with SVG connections
- Schema: left entity list + relationships, right entity detail table + visual diagram
- Directory: left tree, right file preview with syntax-highlighted code
- Ideas: left capture form, right filterable ideas list
- AI Chat: left session list, right conversation thread
- Settings: left settings nav, right tabbed settings panels

## Visual Language

### Color Usage
- `#0c1a1f` — deep ocean background, pervasive darkness
- `#142830` — surface panels, slightly elevated from background
- `#00e5cc` — primary accent for active states, highlights, values
- `#ff6b9d` — secondary accent for alerts, contrast indicators
- `#1e3a45` — borders, dividers, subtle structural lines

### Typography
- **Exo 2** for headings — technical, geometric, modern
- **Work Sans** for body — clean readability at small sizes
- **JetBrains Mono** for code, entity fields, technical data

### Interaction Language
- **Button hover**: liquid fill rises from bottom (CSS `::before` with `height` transition)
- **Button click**: ripple pulse from click point outward
- **Card hover**: border glows with bioluminescent accent (`box-shadow`)
- **Page transitions**: brief loading wave overlay, then panes fade in
- **Scroll reveal**: items animate in with `translateY` + `opacity` stagger
- **Input focus**: cyan glow border with sonar-ping animation
- **Toggle switch**: liquid fill illusion via `::after` pseudo-element
- **Idle ambient**: 3 small bubbles rise very slowly (18-25s cycle)
- **Success feedback**: cyan flash notification in top-right

### Divider Design
- 3px vertical bar between panes
- Gradient animation pulses from top to bottom with accent color
- Responds to hover with increased opacity
- Cursor changes to `col-resize` for draggability affordance

## Responsive Behavior
- **1536px+**: Larger font size, wider panes, 4-column stat grid
- **768px-**: Stacked pane layout (top/bottom), horizontal dividers, icon-only toolbar buttons, mobile menu toggle

## Accessibility
- All navigation via keyboard (Alt+1-0 for view switching)
- ARIA labels on navigation and landmarks
- Sufficient color contrast (accent on dark background)
- Focus-visible states on interactive elements
- Semantic HTML structure throughout

## File Inventory
| File | Purpose |
|------|---------|
| `index.html` | Complete SPA with all 10 views |
| `style.css` | Full responsive stylesheet |
| `app.js` | Navigation, interactions, micro-feedback |
| `README.md` | This document |
| `validation/handoff.json` | Structural uniqueness handoff |
| `validation/inspiration-crossreference.json` | Design lineage |
