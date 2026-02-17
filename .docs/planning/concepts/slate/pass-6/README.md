# Slate Pass 6 — Concrete Brutalist Bunker

## Concept Overview

This pass channels a military defense installation / command bunker aesthetic. The UI feels like operating inside a hardened concrete bunker with narrow observation slits, blast-door transitions, radar sweep displays, and military stencil typography. Everything is functional, dense, and designed to survive — zero decoration, pure operational utility.

## Design Direction

**Style**: Concrete brutalist bunker — raw exposed concrete walls, military olive drab surfaces, amber warning indicators, claustrophobic intensity of a command installation.

**Content Persona**: Defense/security contractor. All content is themed around military operations, weapons systems, intelligence briefs, and chain-of-command hierarchies.

**Uniqueness Profile**: Magazine-spread layout with hidden-hamburger navigation, fullscreen overlay menu, editorial columns, parallax layers, spacious density with mixed alignment.

## Palette

| Token   | Value     | Usage                        |
|---------|-----------|------------------------------|
| bg      | `#2a2e20` | Military olive dark base     |
| text    | `#d4d0c0` | Warm tan text on dark bg     |
| surface | `#353828` | Olive-tinted concrete panels |
| accent  | `#b5b0a1` | Stone/concrete neutral       |
| accent2 | `#d4a020` | Amber warning indicator      |
| border  | `#4a4e38` | Olive border lines           |

## Typography

- **Headings**: Bebas Neue — bold condensed sans-serif with military stencil energy
- **Body**: Azeret Mono — monospace terminal feel for all body text and data
- **Mono**: Azeret Mono — consistent monospace throughout

## Navigation Pattern

Hidden hamburger button in the top bar triggers a fullscreen overlay menu. Navigation items are numbered (01-10) with military-style labels and status light indicators. Active items receive a diagonal rank-stripe indicator.

## Interaction Design

| Category       | Implementation                                                                |
|----------------|-------------------------------------------------------------------------------|
| buttonHover    | Amber warning flash — brief staccato border pulse on hover                    |
| buttonClick    | Blast-door confirm press — heavy downward slam with amber confirmation        |
| cardHover      | Bunker-slit viewport peek — border highlights amber, content revealed         |
| pageTransition | Blast door slide — thick concrete panels close from edges then open on center |
| scrollReveal   | Declassified redaction — black bars slide away revealing content underneath   |
| navItemHover   | Status light amber blink — military equipment readiness signal                |
| navItemActive  | Active duty stripe — diagonal olive and amber stripes on left edge            |
| inputFocus     | Perimeter scan border — bright line sweeps around input continuously          |
| toggleSwitch   | Missile switch guard — first click lifts guard, second confirms toggle        |
| tooltips       | Classified briefing popup — stencil mono text with TOP SECRET header stamp    |
| loadingState   | Radar sweep — rotating phosphor line with blip markers                        |
| idleAmbient    | Camo pattern slow shift — olive/concrete/amber patches drift glacially        |
| microFeedback  | Confirmed stencil stamp — military CONFIRMED stamp in amber                   |

## Views

1. **Dashboard** — Command center with radar activity monitor, bunker-slit viewport stats, threat-level gauge bars, operations log feed
2. **Projects** — Operations manifest with military codenames, classification levels, status codes (ACTIVE/STANDBY/COMPLETE)
3. **Project Workspace** — Bunker command station with primary display panel, communications rack, status blocks
4. **Kanban** — Mission status board with operational phases (BRIEFING/DEPLOYED/ENGAGED/DEBRIEFED), mission dossier cards
5. **Whiteboard** — Tactical operations map with SVG strategic positions, military symbology, movement arrows with distance annotations
6. **Schema Planner** — Equipment manifest with NSN codes, technical specifications in military nomenclature
7. **Directory Tree** — Chain of command hierarchy with rank indicators, unit designations, status lights
8. **Ideas** — Intelligence bulletin board with classification headers, priority stripes, redaction-ready formatting
9. **AI Chat** — Secure radio transmission with call signs, timestamp headers, OVER/OUT terminators
10. **Settings** — Bunker systems control panel with missile-guard toggles, blast-door section dividers

## Libraries Used

1. **Anime.js** (v3.2.2) — Staggered entrance animations, gauge fill animations, tactical map node pulsing, surface color shifts for ambient camo effect
2. **Typed.js** (v2.1.0) — Typewriter effect on the dashboard hero subtitle for command terminal feel

## Inspiration Cross-References

- **Lockheed Martin**: Domain-based navigation taxonomy adapted as numbered operational sections, mission-focused language throughout
- **General Dynamics**: Steel/olive bi-tonal palette, specification-panel content blocks with labeled data points in grid format
- **Palantir Technologies**: Sparse typography pacing, tactical SVG line-art on dark backgrounds, one-element-per-section editorial flow

## Anti-Repeat Compliance

- Pass 1 used dark charcoal carved slate with amber -> This uses military olive concrete (#2a2e20) with distinct camo patterns
- Pass 2 used geological strata with gold -> This uses bunker concrete with military operational content
- Pass 3 used obsidian volcanic glass with red fire -> This uses olive/amber military palette, no red
- Pass 4 used warm sandstone desert with sage -> This uses cold concrete bunker tones with military olive

## Responsive Behavior

- **Desktop** (1200px+): Full editorial column layouts, 4-column kanban, 2-column project grid
- **Tablet** (768px): 2-column metrics, stacked workspace, reduced spacing
- **Mobile** (390px): Single-column everything, hamburger navigation, 44px+ touch targets, 14px minimum text
