import { test, expect, request as pwRequest, type Page } from '@playwright/test';

/**
 * Role-gated UI capture — proves the workspace renders DIFFERENTLY per project
 * role: an OWNER sees the visibility toggle + member-management controls; a
 * VIEWER sees a read-only visibility badge and NO invite form.
 */

const BASE = 'http://localhost:3000';
const PW = 'TestPass123!';
const SHOT = '../../.docs/validation/screenshots/uat-roles-2026-06-01';
const ts = `${Date.now()}`;

async function uiSignIn(page: Page, email: string) {
  await page.goto('/signin');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(PW);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 20_000 });
}

test('Role-gated workspace UI — OWNER vs VIEWER', async ({ browser }) => {
  test.setTimeout(120_000);

  const ownerEmail = `ru-owner-${ts}@test.local`;
  const viewerEmail = `ru-viewer-${ts}@test.local`;

  const ownerCtx = await pwRequest.newContext({ baseURL: BASE });
  const viewerCtx = await pwRequest.newContext({ baseURL: BASE });
  const ownerSU = await (await ownerCtx.post('/api/auth/signup', { data: { email: ownerEmail, password: PW } })).json();
  const viewerSU = await (await viewerCtx.post('/api/auth/signup', { data: { email: viewerEmail, password: PW } })).json();
  await ownerCtx.post('/api/auth/signin', { data: { email: ownerEmail, password: PW } });
  const viewerId = viewerSU?.user?.id;
  expect(ownerSU?.user?.id && viewerId).toBeTruthy();

  // Owner creates a project and adds the viewer as VIEWER
  const proj = await (await ownerCtx.post('/api/projects', { data: { name: `Role UI Project ${ts}` } })).json();
  const pid = proj?.project?.id ?? proj?.id;
  await ownerCtx.post(`/api/projects/${pid}/members`, { data: { userId: viewerId, role: "VIEWER" } });

  // ── OWNER view ──
  const ownerBrowser = await browser.newContext();
  const ownerPage = await ownerBrowser.newPage();
  await uiSignIn(ownerPage, ownerEmail);
  await ownerPage.goto(`/projects/${pid}`);
  await ownerPage.waitForLoadState('domcontentloaded');
  await ownerPage.waitForTimeout(1500);
  // Owner sees the interactive visibility toggle
  await expect(ownerPage.locator('[data-testid="visibility-toggle"]')).toBeVisible({ timeout: 8000 });
  await ownerPage.screenshot({ path: `${SHOT}/owner-sees-toggle.png` });
  // Owner sees the member invite form
  await ownerPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await ownerPage.waitForTimeout(500);
  await expect(ownerPage.locator('input[placeholder*="Invite by email" i]')).toBeVisible({ timeout: 5000 });
  await ownerPage.screenshot({ path: `${SHOT}/owner-sees-invite-form.png` });

  // ── VIEWER view ──
  const viewerBrowser = await browser.newContext();
  const viewerPage = await viewerBrowser.newPage();
  await uiSignIn(viewerPage, viewerEmail);
  await viewerPage.goto(`/projects/${pid}`);
  await viewerPage.waitForLoadState('domcontentloaded');
  await viewerPage.waitForTimeout(1500);
  // Viewer sees a READ-ONLY visibility badge, NOT the interactive toggle
  await expect(viewerPage.locator('[data-testid="visibility-readonly"]')).toBeVisible({ timeout: 8000 });
  await expect(viewerPage.locator('[data-testid="visibility-toggle"]')).toHaveCount(0);
  await viewerPage.screenshot({ path: `${SHOT}/viewer-sees-readonly.png` });
  // Viewer does NOT see the member invite form
  await viewerPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await viewerPage.waitForTimeout(500);
  await expect(viewerPage.locator('input[placeholder*="Invite by email" i]')).toHaveCount(0);
  await viewerPage.screenshot({ path: `${SHOT}/viewer-no-invite-form.png` });

  await ownerBrowser.close();
  await viewerBrowser.close();
});
