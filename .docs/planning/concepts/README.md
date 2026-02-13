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
- `assets/` (downloaded/local visual media)
- `validation/` (visual validation output target)
  - `validation/handoff.json`
  - `validation/inspiration-crossreference.json`
  - `validation/report.playwright.json`
  - `validation/screenshots/*.png`

Quality requirements for new runs:
- Include at least one `awwwards.com` inspiration reference per pass.
- Include `three.js` + `gsap` and meaningful motion/3D treatment.
- Include explicit uniqueness flag handoff per pass (`shellMode`, `navPattern`, `contentFlow`, `scrollMode`, `alignment`, `motionLanguage`).
- Persist handoff source trace in `validation/handoff.json` and `validation/inspiration-crossreference.json`.

## Quick Review

Open any pass directly:
- `.docs/planning/concepts/<style>/pass-1/index.html`
- `.docs/planning/concepts/<style>/pass-2/index.html`

## Additional Generation Sets (Append Mode)

To keep existing passes and generate an additional set of 10, run orchestrator with `-OutputSetName`.

Example:
```bash
powershell -NoProfile -ExecutionPolicy Bypass -File .codex/skills/planning-frontend-design-orchestrator/scripts/run-local-orchestration.ps1 -OutputSetName run-YYYYMMDD-extra-01
```

This writes a new isolated set under:
- `.docs/planning/concepts/run-YYYYMMDD-extra-01/<style>/pass-1`
- `.docs/planning/concepts/run-YYYYMMDD-extra-01/<style>/pass-2`

## Playwright Visual Validation

Script:
- `.codex/skills/frontend-design-subagent/scripts/validate-concepts-playwright.mjs`

Run:
```bash
node .codex/skills/frontend-design-subagent/scripts/validate-concepts-playwright.mjs --concept-root .docs/planning/concepts
```

Output:
- Per-pass screenshots under `validation/screenshots/`
- Per-pass report at `validation/report.playwright.json`
- Aggregate report: `.docs/planning/concepts/validation-report.json`
- Uniqueness report: `.docs/planning/concepts/uniqueness-report.json`
