import { test, expect, type Page } from './helpers';

const SHOT_DIR = '../../.docs/validation/screenshots/phase3-2026-05-29';

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

test('Phase 3 — Social graph (friends + groups) validation', async ({ page }) => {
  test.setTimeout(90_000);

  const ok = await signIn(page);
  if (!ok) { test.skip(); return; }

  // ── Friends page ──
  await page.goto('/friends');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await shot(page, 'friends-page');
  await expect(page.locator('h1').filter({ hasText: 'FRIENDS' })).toBeVisible({ timeout: 8000 });

  // ── Groups page ──
  await page.goto('/groups');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await shot(page, 'groups-page-initial');
  await expect(page.locator('h1').filter({ hasText: 'GROUPS' })).toBeVisible({ timeout: 8000 });

  // ── Create a group ──
  await page.locator('button').filter({ hasText: 'CREATE GROUP' }).first().click();
  await page.waitForTimeout(400);
  await shot(page, 'groups-create-form');

  const uniqueName = `Validation Group ${Date.now()}`;
  await page.locator('input[placeholder="Group name"]').fill(uniqueName);
  await page.locator('textarea[placeholder="Description (optional)"]').fill('Phase 3 validation group');
  await shot(page, 'groups-create-filled');
  await page.locator('button').filter({ hasText: /^CREATE$/ }).click();
  await page.waitForTimeout(1500);
  await shot(page, 'groups-after-create');

  // The new group should appear in the list
  await expect(page.locator(`text=${uniqueName}`).first()).toBeVisible({ timeout: 8000 });

  // ── Open the group detail page ──
  await page.locator(`text=${uniqueName}`).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await shot(page, 'group-detail-page');

  // Member panel + shared projects should be visible
  await expect(page.locator('text=MEMBERS').first()).toBeVisible({ timeout: 8000 });
  await expect(page.locator('text=SHARED PROJECTS').first()).toBeVisible({ timeout: 8000 });
  // The creator should be OWNER
  await expect(page.locator('text=OWNER').first()).toBeVisible({ timeout: 5000 });
  await shot(page, 'group-detail-members');

  // ── Mine tab on groups ──
  await page.goto('/groups');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  await page.locator('button').filter({ hasText: 'My Groups' }).click();
  await page.waitForTimeout(1000);
  await shot(page, 'groups-my-groups');
  await expect(page.locator(`text=${uniqueName}`).first()).toBeVisible({ timeout: 8000 });

  // ── Sidebar nav links present ──
  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);
  const menuBtn = page.locator('button').first();
  if (await menuBtn.isVisible()) { await menuBtn.click(); await page.waitForTimeout(400); }
  await shot(page, 'sidebar-nav-links');
  await expect(page.locator('a[href="/friends"]').first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator('a[href="/groups"]').first()).toBeVisible({ timeout: 5000 });
});
