# Usage Guide: Research

## Quick Start

Create `urls.txt` (one URL per line), then run a hook script:

```bash
bash .claude/hooks/scripts/playwright-visual-snapshots.sh
bash .claude/hooks/scripts/playwright-console-errors.sh
```

## Detailed Usage

### Via Agent

```
/agent research-automation-agent "Capture visual snapshots of all pages in urls.txt"
/agent research-automation-agent "Check for console errors on http://localhost:3000"
```

### User Story Smoke Test

Prepare `stories.csv` (`story_id,url,description` columns), then:
```
/agent research-automation-agent "Run user story smoke screenshots from stories.csv"
```

### Structured Research Session (ADR-tracked)

```
/skill research-docs-session
```

Creates phase plan, captures sources, validates citations, archives phase, commits.

### Data Extraction

```typescript
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const titles = await page.locator('h2').allTextContents();
await browser.close();
```

## Troubleshooting

**No hook script output** — Ensure `urls.txt` exists at repo root with valid URLs.

**Playwright not installed** — `npm init playwright@latest && npx playwright install`.

**Blank screenshots** — Add `await page.waitForLoadState('networkidle')` before capture.
