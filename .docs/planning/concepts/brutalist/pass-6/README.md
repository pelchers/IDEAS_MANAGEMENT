# Brutalist Pass 6 — FREIGHT // CMD

## Concept Overview

**Warehouse Industrial Logistics** — A shipping warehouse operations center UI built on corrugated steel surfaces, barcode labels, hazmat stripe borders, and shipping container proportions. The interface channels a freight terminal control room where every element serves a utilitarian purpose.

## Design Direction

The UI is designed as if it were the control screen on a warehouse management terminal. Navigation uses manifest-style numbered tabs across the top (browser-tab-row pattern). Content is organized in container-grid units with heavy borders, monospaced readouts, and industrial color coding. The aesthetic is unapologetically functional — no decoration, just structure.

### Content Persona

**Logistics / Supply Chain Company** — All data reflects a global freight and warehousing operation: shipment tracking numbers, container weights, warehouse zone codes, origin-destination pairs, and dispatch radio communications.

## Palette

| Token   | Color   | Usage                    |
|---------|---------|--------------------------|
| bg      | #2b2b2b | Dark steel background    |
| text    | #e8e4de | Light cream readout text |
| surface | #383838 | Panel/card backgrounds   |
| accent  | #d4622a | Rust orange — primary    |
| accent2 | #5a8fa8 | Steel blue — secondary   |
| border  | #555555 | Structural grid lines    |

## Typography

- **Headings:** Saira Condensed (700-900) — condensed, industrial
- **Body/Mono:** DM Mono — terminal readout feel

## Uniqueness Profile

- **Shell Mode:** Top tab strip (browser-tab-row)
- **Content Flow:** Full-width panels with horizontal snap feel
- **Alignment:** Left-aligned
- **Density:** Dense
- **Component Tone:** Hard

## Interaction Design

| Category        | Implementation                                              |
|-----------------|-------------------------------------------------------------|
| Button Hover    | Corrugated steel press indent pattern overlay               |
| Button Click    | Hydraulic press down — slow compression, fast release snap  |
| Card Hover      | Forklift lift raise — card rises with bottom-edge shadow    |
| Page Transition | Container door slide — heavy lateral clip-path reveal       |
| Scroll Reveal   | Pallet stack drop-in — content drops from above staggered   |
| Nav Item Hover  | Barcode scanner laser sweep across tab                      |
| Nav Item Active | Hazmat stripe diagonal bar indicator                        |
| Input Focus     | Scanning laser border that rotates around input edges       |
| Toggle Switch   | Circuit breaker flip with mechanical snap scale pulse       |
| Tooltips        | Shipping label popup with barcode, weight, destination      |
| Loading State   | Barcode scan progress bar with percentage mono readout      |
| Idle Ambient    | Conveyor belt drift on hazmat dividers                      |
| Micro Feedback  | Green "SCAN OK" badge flash with checkmark                  |

## Views

1. **OPS DECK (Dashboard)** — Origin/destination tracking hero, step pipeline, 4 gauge clusters, metrics bar, dispatch log table
2. **MANIFESTS (Projects)** — Shipping manifest table with 6 projects, filtering, progress bars, zebra striping
3. **DOCK BAY (Project Workspace)** — Loading dock layout with info grid, task manifest, notes, sidebar clipboard
4. **FLOW BOARD (Kanban)** — 4 loading zones (INBOUND/STAGING/OUTBOUND/DELIVERED) with drag-and-drop package cards
5. **ROUTE MAP (Whiteboard)** — SVG supply chain diagram with warehouse nodes and animated route lines
6. **INVENTORY DB (Schema Planner)** — 6 entity cards (Warehouse, Zone, Bin, SKU, Shipment, Supplier) with field specs
7. **WAREHOUSE (Directory Tree)** — Aisle > Shelf > Bin hierarchy with location codes and item info
8. **IDEAS (Ideas Board)** — Polaroid-style cards with SVG icons, descriptions, and rust orange label strips
9. **DISPATCH (AI Chat)** — Radio communication format with callsigns, timestamps, and static line separators
10. **CTRL PANEL (Settings)** — 4 settings groups with circuit breaker toggles, selects, and inputs

## Libraries Used

- **Anime.js 3.2.2** — Gauge circle animations, route line drawing, counter animations
- **SortableJS 1.15.6** — Kanban card drag-and-drop between zones
- **Phosphor Icons (Bold)** — Available but primarily using inline SVG icons for warehouse/logistics imagery

## Anti-Repeat Compliance

- Pass 1 (light paper+red ink) — This pass uses dark corrugated steel with rust orange
- Pass 2 (newspaper broadsheet) — This pass uses shipping manifest grid tables
- Pass 3 (terminal CRT green) — This pass uses warehouse operations panel with industrial multi-color readouts
- Pass 4 (blueprint navy) — This pass uses industrial warehouse with steel gray palette

## Responsive Behavior

- **Desktop (1536px):** Full tab strip, multi-column grids, sidebar visible
- **Tablet (768px):** Condensed grids, stacked columns
- **Mobile (390px):** Hamburger menu with slide-out nav drawer, single column, touch-optimized 44px targets
