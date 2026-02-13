# Frontend Concepts

This folder contains 5 distinct style families with 2 passes each (10 total concept passes):

1. `signal-brutalist`
2. `aurora-glass`
3. `ledger-editorial`
4. `industrial-terminal`
5. `playful-clay`

Each style has:
- `pass-1/`
- `pass-2/`

Each pass includes:
- `index.html`
- `style.css`
- `app.js`
- `README.md`
- `validation/playwright/` (visual validation output target)

## Quick Review

Open any pass directly:
- `.docs/planning/concepts/<style>/pass-1/index.html`
- `.docs/planning/concepts/<style>/pass-2/index.html`

## Playwright Visual Validation

Script:
- `.codex/skills/frontend-design-subagent/scripts/validate-concepts-playwright.mjs`

Run:
```bash
node .codex/skills/frontend-design-subagent/scripts/validate-concepts-playwright.mjs --concept-root .docs/planning/concepts
```

Output:
- Per-pass screenshots and `report.json` under `validation/playwright/`
- Aggregate report: `.docs/planning/concepts/validation-report.json`

