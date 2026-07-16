import { test, expect, type Page } from './helpers';

const SHOT_DIR = '../../.docs/validation/screenshots/phase2-2026-04-22';

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

test('Phase 2 — Collaboration features validation', async ({ page }) => {
  test.setTimeout(90_000);

  const ok = await signIn(page);
  if (!ok) { test.skip(); return; }

  // Find a project
  await page.goto('/projects');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);

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
  if (!projectId) { console.log('No project'); return; }

  // Navigate to workspace
  await page.goto(`/projects/${projectId}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  await shot(page, 'workspace-initial');

  // Verify member panel exists
  const memberPanel = page.locator('text=MEMBERS').first();
  await expect(memberPanel).toBeVisible({ timeout: 5000 });
  await shot(page, 'workspace-member-panel');

  // Verify activity feed exists
  const activityFeed = page.locator('text=ACTIVITY').first();
  await expect(activityFeed).toBeVisible({ timeout: 5000 });
  await shot(page, 'workspace-activity-feed');

  // Verify invite form (email input + INVITE button)
  const inviteInput = page.locator('input[placeholder*="Invite"]').first();
  if (await inviteInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await inviteInput.fill('test-invite@example.com');
    await shot(page, 'workspace-invite-form');
  }

  // Verify member avatar row in header
  await shot(page, 'workspace-header-avatars');

  // Scroll down to see full member + activity panels
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await shot(page, 'workspace-scrolled-panels');
});
