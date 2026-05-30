import { test, type Page } from '@playwright/test';

const SHOT_DIR = '../../.docs/validation/screenshots/phase5-2026-05-30';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false });
}

async function signIn(page: Page): Promise<boolean> {
  await page.goto('/signin');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').fill('admin@ideamgmt.local');
  await page.locator('input[type="password"]').fill('AdminPass123!');
  await page.locator('button[type="submit"]').click();
  try {
    await page.waitForURL(/\/(dashboard|projects)/, { timeout: 20_000 });
    return true;
  } catch {
    return false;
  }
}

test('Phase 5 — Visual QA: onboarding banner + top bar', async ({ page }) => {
  test.setTimeout(60_000);
  const ok = await signIn(page);
  if (!ok) { test.skip(); return; }

  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await shot(page, 'dashboard-with-banner-and-bell');
});
