# Usage Guide: Research

## Quick Start

1. Create a `urls.txt` file with one URL per line
2. Run the appropriate hook script:

```bash
# Visual snapshots (desktop + mobile)
bash .claude/hooks/scripts/playwright-visual-snapshots.sh

# Check for console errors
bash .claude/hooks/scripts/playwright-console-errors.sh

# Page metadata / SEO
bash .claude/hooks/scripts/web-research-metadata.sh
```

## Detailed Usage

### Visual Feedback Request

```
/agent research-automation-agent "Capture visual snapshots of all pages in urls.txt at 1440x900 and 375x812"
```

### User Story Smoke Testing

Prepare `stories.csv`:
```csv
story_id,url,description
us-001,http://localhost:3000,Landing page loads
us-002,http://localhost:3000/login,Login page accessible
```

```
/agent research-automation-agent "Run user story smoke screenshots from stories.csv"
```

### Structured Research Session (with ADR)

```
/skill research-docs-session
```

The skill enforces ADR phase structure: creates a phase plan, captures sources, validates citations, creates a phase review, and commits.

### Data Extraction with Playwright

```typescript
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const data = await page.locator('.product').evaluateAll(
  items => items.map(i => ({ name: i.querySelector('h3')?.textContent }))
);
await browser.close();
```

## Troubleshooting

**Hook script returns no output**
Ensure `urls.txt` exists in the repo root with at least one URL. The scripts read from this file by default.

**Playwright not installed**
```bash
npm init playwright@latest
npx playwright install
```

**Screenshots are blank/white**
The page may not have fully loaded. Add `await page.waitForLoadState('networkidle')` before capture.
