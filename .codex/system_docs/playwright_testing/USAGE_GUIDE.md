# Usage Guide: Playwright Testing

## Quick Start

```bash
# Install Playwright
npm init playwright@latest

# Run all tests
npx playwright test

# UI mode (recommended for development)
npx playwright test --ui
```

## Detailed Usage

### Writing a Test

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/dashboard/);
});
```

### Using playwright-cli for One-Off Automation

```bash
playwright-cli open https://example.com
playwright-cli snapshot                    # capture accessibility tree
playwright-cli click e5                   # click by ref from snapshot
playwright-cli screenshot --filename=out.png
playwright-cli close
```

### Visual Regression

```typescript
// Capture baseline
await expect(page).toHaveScreenshot('homepage.png');
// On subsequent runs, Playwright diffs against baseline
```

### Running Specific Tests

```bash
npx playwright test auth.spec.ts           # specific file
npx playwright test --project=chromium    # specific browser
npx playwright test --debug               # debug mode
```

## Troubleshooting

**Element not found / timeout**
Use `--ui` mode to inspect the DOM. Prefer `getByRole` and `getByLabel` over CSS selectors. Check if the element requires a `waitFor()` call.

**Visual regression false positives**
Delete baseline screenshots to regenerate: `rm tests/screenshots/*.png`. Re-run to create new baselines.

**playwright-cli command not found**
Install globally: `npm install -g playwright-cli` or use `npx playwright-cli`.

**Tests fail in CI but pass locally**
Add `retries: 2` in `playwright.config.ts` for CI. Use `workers: 1` to avoid parallelism issues. Check that `baseURL` matches the CI server URL.
