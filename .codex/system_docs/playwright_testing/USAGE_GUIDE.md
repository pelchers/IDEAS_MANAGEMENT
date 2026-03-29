# Usage Guide: Playwright Testing

## Quick Start

```bash
npm init playwright@latest
npx playwright test --ui   # recommended for dev
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

Prefer `getByRole` and `getByLabel` over CSS selectors.

### Visual Regression

```typescript
await expect(page).toHaveScreenshot('homepage.png');  // diffs on re-run
```

### playwright-cli (Interactive)

```bash
playwright-cli open https://example.com
playwright-cli snapshot               # capture accessibility tree
playwright-cli click e5              # click by ref
playwright-cli screenshot --filename=out.png
playwright-cli close
```

### Common Test Commands

```bash
npx playwright test auth.spec.ts       # specific file
npx playwright test --project=chromium # specific browser
npx playwright test --debug            # debug mode
npx playwright show-report             # view HTML report
```

## Troubleshooting

**Element not found / timeout** — Use `--ui` mode to inspect. Check `waitFor()` is used for dynamic content.

**Visual regression false positives** — Delete baseline PNGs and regenerate.

**Tests fail in CI** — Add `retries: 2` and `workers: 1` in `playwright.config.ts` for CI env.
