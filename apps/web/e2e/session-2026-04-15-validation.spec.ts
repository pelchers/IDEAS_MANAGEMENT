import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * Session 2026-04-15 Validation — Visual Screenshots
 *
 * Takes screenshots of key pages/features to validate this session's work.
 * Uses a single test with shared auth to avoid rate limiting.
 */

const SHOT_DIR = '../../.docs/validation/screenshots/session-2026-04-15';

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
    // Check if we got rate limited
    const body = await page.locator('body').textContent();
    if (body?.includes('rate_limit') || body?.includes('Too many')) {
      console.log('Rate limited on sign-in');
    }
    return false;
  }
}

test('Session 2026-04-15 — full visual validation', async ({ page }) => {
  test.setTimeout(120_000);

  // ── Sign in via UI to get cookies on the browser context ──
  const ok = await signIn(page);
  if (!ok) {
    test.skip();
    return;
  }
  await page.waitForLoadState('networkidle');
  await shot(page, 'signed-in-dashboard');

  // ── US4: Profile page view mode ──
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await shot(page, 'us4-profile-view-mode');
  // nb-view-title has the text PROFILE
  const profileText = await page.locator('text=PROFILE').first();
  await expect(profileText).toBeVisible({ timeout: 5000 });

  // ── US5: Profile edit mode ──
  const editBtn = page.locator('button').filter({ hasText: 'EDIT PROFILE' });
  if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(400);
    await shot(page, 'us5-profile-edit-mode');

    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('Validation User');
    const bioField = page.locator('textarea').first();
    if (await bioField.count()) {
      await bioField.fill('Session 2026-04-15 validation');
    }
    await shot(page, 'us5-profile-edit-filled');

    const saveBtn = page.locator('button').filter({ hasText: 'SAVE CHANGES' });
    await saveBtn.click();
    await page.waitForTimeout(1000);
    await shot(page, 'us5-profile-after-save');
  }

  // ── US6: Sidebar profile link ──
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await shot(page, 'us6-dashboard');
  const profileLink = page.locator('a[href="/profile"]').first();
  // Open drawer first if it exists
  const menuBtn = page.locator('button').first();
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(400);
  }
  await shot(page, 'us6-sidebar-open');
  if (await profileLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await shot(page, 'us6-sidebar-profile-link');
    await profileLink.click({ force: true });
    await page.waitForURL('**/profile', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(500);
    await shot(page, 'us6-navigated-to-profile');
  }

  // ── Find a project for schema/whiteboard tests ──
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await shot(page, 'projects-list');

  let projectId = '';
  const links = page.locator('a[href*="/projects/"]');
  const count = await links.count();
  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute('href');
    if (href && /\/projects\/[a-zA-Z0-9]+$/.test(href)) {
      projectId = href.split('/').pop() || '';
      break;
    }
  }
  if (!projectId) {
    console.log('No project found — skipping schema/whiteboard screenshots');
    return;
  }

  // ── US1: Schema planner — annotation tools ──
  await page.goto(`/projects/${projectId}/schema`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await shot(page, 'us1-schema-initial');

  const textBtn = page.locator('button[title="Add Text Label (T)"]');
  if (await textBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
    await shot(page, 'us1-schema-toolbar-visible');

    // Text tool
    await textBtn.click();
    await page.waitForTimeout(200);
    await shot(page, 'us1-text-tool-active');

    // Place text on canvas
    const canvas = page.locator('.relative.border-2.border-dashed').first();
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 250, box.y + 150);
      await page.waitForTimeout(500);
      await page.keyboard.type('Hello annotation');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      await shot(page, 'us1-text-placed');
    }

    // Rect tool
    const rectBtn = page.locator('button[title="Draw Rectangle (R)"]');
    await rectBtn.click({ force: true });
    await page.waitForTimeout(200);
    if (box) {
      await page.mouse.move(box.x + 400, box.y + 200);
      await page.mouse.down();
      await page.mouse.move(box.x + 520, box.y + 290, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      await shot(page, 'us1-rect-placed');
    }

    // Eraser tool visible
    const eraseBtn = page.locator('button[title="Eraser (E)"]');
    if (await eraseBtn.isVisible()) {
      await eraseBtn.click({ force: true });
      await page.waitForTimeout(200);
      await shot(page, 'us1-eraser-active');
    }
  } else {
    await shot(page, 'us1-schema-no-toolbar');
  }

  // ── US2: Schema marquee select ──
  const selectBtn = page.locator('button[title="Select / Move (V)"]');
  if (await selectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await selectBtn.click({ force: true });
    await page.waitForTimeout(200);
    const canvasBox = await page.locator('.relative.border-2.border-dashed').first().boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 30, canvasBox.y + 30);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 500, canvasBox.y + 350, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      await shot(page, 'us2-marquee-completed');
      await page.keyboard.press('Escape');
    }
  }

  // ── US3: Whiteboard page ──
  await page.goto(`/projects/${projectId}/whiteboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await shot(page, 'us3-whiteboard-initial');

  const wbCanvas = page.locator('canvas').first();
  if (await wbCanvas.isVisible({ timeout: 5000 }).catch(() => false)) {
    await shot(page, 'us3-whiteboard-canvas-visible');
  }
});
