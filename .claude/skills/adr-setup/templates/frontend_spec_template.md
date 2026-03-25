<!--
  FRONTEND SPECIFICATION REFERENCE

  What this file is:
    Design reference for all frontend/UI work in this project (or session).
    Any agent building UI MUST read this file before writing .tsx/.css files.

  Project context (read these if they exist):
    - CLAUDE.md (project root) — project conventions and architecture
    - .docs/planning/ — PRD, feature list, user stories
    - .adr/orchestration/ — session task lists and phase plans
    - .adr/orchestration/<SESSION>/prd.md — session-specific requirements
    - .adr/orchestration/<SESSION>/technical_requirements.md — tech constraints

  How to use this file:
    1. Read the Spec Source Type to know where the design reference lives
    2. Read the referenced prototype/URL/spec before building ANY UI
    3. Follow the Coherence Rules during implementation
    4. After building, validate output matches this spec

  If this file says "ACTION REQUIRED":
    The spec was auto-generated but the project has no design system yet.
    Provide design requirements before proceeding with frontend work.
-->

# Frontend Specification Reference

Session: <SESSION_NAME>
Date: <YYYY-MM-DD>

## Project Context
<!-- Auto-populated by require-frontend-spec hook or manually filled -->
- **CLAUDE.md:** <exists at path | not found>
- **PRD:** <path if exists | not yet created>
- **Tech Spec:** <path if exists | not yet created>
- **Task List:** <path if exists | not yet created>
- **Design Pass Output:** <path to chosen design pass folder | N/A>
- **ADR Status:** <orchestration exists with N session subfolders | ADR not set up yet — this spec was created standalone>

## Spec Source Type
<!-- Check one or more -->
- [ ] Internal prototype (HTML/CSS files in project)
- [ ] External reference (URL, Figma, screenshot)
- [ ] Chat-prompted spec (requirements pasted below)
- [ ] Similarity match (reference existing pass with divergences)

## Design System
- **Active Design:** <design name, e.g. "Brutalism Pass 1">
- **Prototype Path:** <path to prototype files, if internal>
- **Design Tokens:** <path to tokens file>
- **Tailwind Preset:** <path to tailwind preset, if applicable>

## Key Colors
- **Primary:** <hex>
- **Secondary:** <hex>
- **Accent:** <hex>

## Reference Pages
<!-- Map app views to their prototype/reference files -->
| App View | Reference File/URL |
|---|---|
| <view name> | <path or URL> |

## Coherence Rules
1. ALL new UI must match the design system tokens
2. Read the relevant prototype/reference BEFORE building any page/component
3. Match layout structure, spacing, and interaction patterns
4. Use ONLY colors from the design tokens
5. New pages without a direct reference must follow the closest existing page's patterns

## External/Chat Spec (if applicable)
<!-- Paste external spec URL, screenshot path, or chat-prompted requirements here -->

## Similarity Match (if applicable)
- **Match Pass:** <pass name> (<N>% match target)
- **Diverge On:** <specific elements to change>
- **Keep Identical:** <elements that must stay the same>
- **Reference Page:** <closest existing page for layout guidance>
