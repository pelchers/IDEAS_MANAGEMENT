# Layout Uniqueness Research Notes

Date: 2026-02-13

## Sources
- Awwwards collections:
  - https://www.awwwards.com/websites/sites_of_the_day/
  - https://www.awwwards.com/websites/transitions/
  - https://www.awwwards.com/websites/brutalism/
  - https://www.awwwards.com/websites/typography/
- MDN CSS Grid:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
- GSAP ScrollTrigger docs:
  - https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- three.js fundamentals:
  - https://threejs.org/manual/#en/fundamentals
- web.dev animation performance:
  - https://web.dev/articles/animations-guide

## Practical Implications Applied To Orchestration
1. Structural uniqueness is not just color/typography.
   - We enforce explicit shell differences: split rail, radial stage, top ribbon, dock workbench, timeline, notebook, cockpit wall, billboard stack, horizontal gallery.
2. Navigation pattern drives information architecture.
   - We rotate nav systems per pass: rail, segmented tabs, dock pills, chip cloud, timeline dots, command palette, orbital nav.
3. Scroll behavior must differ per pass.
   - We pass and apply explicit scroll modes: reveal, parallax, chapter snap, sticky, horizontal pan.
4. Motion language should be coherent per layout.
   - We pass motion persona (`orbit`, `drift`, `elastic`, `strobe`, `calm`) and map it to three.js scene behavior + GSAP pacing.
5. Inspiration must be grounded in external references.
   - Each pass requires an Awwwards reference plus additional references and a handoff artifact linking those references to uniqueness flags.

## Enforcement Strategy
- Orchestrator creates per-job handoff JSON with:
  - `uniquenessFlags`
  - `inspiration.primaryAwwwards`
  - selected references
  - research links
- Subagent consumes `--handoff-path` and writes consumed values into:
  - `validation/handoff.json`
  - `validation/inspiration-crossreference.json`
- Orchestrator validation fails if handoff coverage, Awwwards references, animation libraries, or media assets are missing.
