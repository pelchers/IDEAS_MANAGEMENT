---
name: frontend-planning-html
description: Generate frontend ideation concepts using plain HTML, CSS, and JavaScript in `.docs/planning/frontend`. Use for early design exploration, style direction reviews, and multi-concept mockups before framework implementation.
---

# Frontend Planning HTML

Create low-friction frontend concept explorations for product planning and stakeholder review.
Generate production-like frontend prototypes with complete sitemap coverage and navigable flows, but without auth gating.

## Workflow

1. Use `.docs/planning/frontend` as the planning workspace.
2. Capture or update the brief in `.docs/planning/frontend/brief.md`.
3. Choose style set from user input.
4. If user does not provide styles, use defaults:
- `brutalist`
- `code-terminal-ide`
- `minimalist`
- `newspaper`
- `mid-century-modern`
5. Choose pass count from user input.
6. If user does not provide pass count, use `1`.
7. Build the intended app sitemap from `.docs/planning/frontend/sitemap.json`.
8. Generate a full multi-page concept per style and pass under `.docs/planning/frontend/concepts/<style-folder>/pass-<N>/`.
9. Keep each concept plain HTML/CSS/JS only:
- `index.html`
- `style.css`
- `app.js`
10. Include all sitemap pages as individual `.html` files in each pass folder.
11. Ensure every page is cross-linked and fully navigable without authentication.
12. Update `.docs/planning/frontend/comparison.md` with style notes and review prompts.

## Guardrails

- Do not use frameworks for ideation concepts.
- Keep concepts self-contained and easy to open locally.
- Prioritize visual differentiation between styles.
- Include responsive behavior for mobile and desktop.
- Include lightweight interactivity in `app.js` only when it supports concept review.

## Output Expectations

- Five style concepts by default unless the user explicitly requests a different count or style set.
- Support multiple passes; default one pass unless user requests more.
- Each pass must represent a full frontend prototype for all sitemap pages and key feature flows.
- A concise comparison sheet describing strengths/tradeoffs for each concept.
- Clear mapping between style name, pass number, and concept folder path.

## References

- Read `.codex/skills/frontend-planning-html/references/default-styles.md` when selecting or extending style directions.
