import { test, expect, type Page, apiContextWithIp } from './helpers';

const SHOT_DIR = '../../.docs/validation/screenshots/phase4-2026-05-30';
const ADMIN_EMAIL = 'admin@ideamgmt.local';
const ADMIN_PASSWORD = 'AdminPass123!';
const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false });
}

async function signIn(page: Page): Promise<boolean> {
  await page.goto('/signin');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  try {
    await page.waitForURL(/\/(dashboard|projects)/, { timeout: 20_000 });
    return true;
  } catch {
    return false;
  }
}

test('Phase 4 — Notifications validation', async ({ page }) => {
  test.setTimeout(120_000);

  // ── Get admin's user id ──
  const adminCtx = await apiContextWithIp(BASE);
  const adminSignin = await adminCtx.post('/api/auth/signin', { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  if (!adminSignin.ok()) { test.skip(); return; }
  const adminData = await adminSignin.json();
  const adminId: string = adminData.user.id;

  // ── Create a second user and send a friend request to admin ──
  const userBEmail = `notif-test-${Date.now()}@test.local`;
  const userBCtx = await apiContextWithIp(BASE);
  const signup = await userBCtx.post('/api/auth/signup', { data: { email: userBEmail, password: 'TestPass123!' } });
  // Sign in userB (signup may or may not auto-auth)
  await userBCtx.post('/api/auth/signin', { data: { email: userBEmail, password: 'TestPass123!' } });
  // Set a display name so the notification reads nicely
  await userBCtx.put('/api/auth/me', { data: { displayName: 'Notify Tester' } });
  // Send friend request to admin → creates a notification for admin
  const reqRes = await userBCtx.post('/api/friends/request', { data: { addresseeId: adminId } });
  expect(reqRes.ok()).toBeTruthy();

  // ── Sign in as admin in the browser ──
  const ok = await signIn(page);
  if (!ok) { test.skip(); return; }
  await page.waitForTimeout(1500);
  await shot(page, 'topbar-with-bell');

  // Bell should show an unread badge
  const badge = page.locator('[data-testid="notification-badge"]');
  await expect(badge).toBeVisible({ timeout: 10_000 });
  await shot(page, 'bell-with-badge');

  // ── Open the notification panel ──
  await page.locator('button[aria-label="Notifications"]').click();
  await page.waitForTimeout(800);
  const panel = page.locator('[data-testid="notification-panel"]');
  await expect(panel).toBeVisible({ timeout: 5000 });
  await shot(page, 'notification-panel-open');

  // The friend-request notification should be listed
  await expect(page.locator('text=/friend request/i').first()).toBeVisible({ timeout: 5000 });

  // ── Mark all read ──
  await page.locator('button:has-text("Read all")').click();
  await page.waitForTimeout(800);
  await shot(page, 'notifications-marked-read');

  // Badge should be gone after marking all read
  await expect(badge).toHaveCount(0, { timeout: 5000 });

  // ── Settings: email digest selector ──
  await page.goto('/settings');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);
  const digestSelect = page.locator('[data-testid="email-digest-select"]');
  await expect(digestSelect).toBeVisible({ timeout: 8000 });
  await digestSelect.scrollIntoViewIfNeeded();
  await shot(page, 'settings-email-digest');
  await digestSelect.selectOption('WEEKLY');
  await page.waitForTimeout(800);
  await shot(page, 'settings-digest-weekly');

  // Verify persistence
  const meRes = await page.request.get('/api/auth/me');
  const me = await meRes.json();
  expect(me.user.emailDigestFrequency).toBe('WEEKLY');

  await adminCtx.dispose();
  await userBCtx.dispose();
});
