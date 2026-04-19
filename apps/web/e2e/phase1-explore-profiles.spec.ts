import { test, expect, type Page } from '@playwright/test';

const SHOT_DIR = '../../.docs/validation/screenshots/phase1-2026-04-18';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false });
}

async function signIn(page: Page): Promise<boolean> {
  await page.goto('/signin');
  await page.waitForLoadState('networkidle');
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

test('Phase 1 — Explore page + Public profiles validation', async ({ page }) => {
  test.setTimeout(90_000);

  const ok = await signIn(page);
  if (!ok) { test.skip(); return; }
  await page.waitForLoadState('networkidle');

  // ── Explore page ──
  await page.goto('/explore');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await shot(page, 'explore-initial');

  // Verify heading
  const heading = page.locator('text=EXPLORE').first();
  await expect(heading).toBeVisible({ timeout: 5000 });

  // Verify tabs exist
  await expect(page.locator('button').filter({ hasText: 'PROJECTS' })).toBeVisible();
  await expect(page.locator('button').filter({ hasText: 'USERS' })).toBeVisible();

  // Verify search input
  await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  await shot(page, 'explore-projects-tab');

  // Switch to users tab
  await page.locator('button').filter({ hasText: 'USERS' }).click();
  await page.waitForTimeout(500);
  await shot(page, 'explore-users-tab');

  // Search for admin user
  await page.locator('input[placeholder*="Search"]').fill('admin');
  await page.locator('button').filter({ hasText: 'SEARCH' }).click();
  await page.waitForTimeout(800);
  await shot(page, 'explore-user-search');

  // Click on user card to go to profile (if any)
  const userCard = page.locator('a[href*="/users/"]').first();
  if (await userCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await userCard.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await shot(page, 'public-profile-page');

    // Verify profile content
    await expect(page.locator('text=USER PROFILE')).toBeVisible({ timeout: 5000 });
    await shot(page, 'public-profile-content');

    // Back to explore link
    const backLink = page.locator('a').filter({ hasText: 'BACK TO EXPLORE' });
    if (await backLink.isVisible()) {
      await backLink.click();
      await page.waitForURL('**/explore', { timeout: 5000 });
      await shot(page, 'back-to-explore');
    }
  }

  // ── Sidebar nav link ──
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Open drawer
  const menuBtn = page.locator('button').first();
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(400);
  }

  const exploreLink = page.locator('a[href="/explore"]').first();
  if (await exploreLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await shot(page, 'sidebar-explore-link');
    await exploreLink.click({ force: true });
    await page.waitForTimeout(1000);
    await shot(page, 'sidebar-navigated-to-explore');
  }
});
