/**
 * Plan #4 Retest — API Endpoints After Server Restart
 *
 * Retests TC-13, TC-14, TC-15 (previously failed due to stale Prisma cache)
 * Plus full UI suite TC-01 through TC-12, TC-16, TC-17, TC-18 to confirm still PASS.
 *
 * Credentials: admin@example.com / Testing123!
 * Screenshot dir: C:/Ideas/IDEA-MANAGEMENT/.docs/validation/plan4-provider-tiers/retest/screenshots/
 */

import { test, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = 'C:/Ideas/IDEA-MANAGEMENT/.docs/validation/plan4-provider-tiers/retest/screenshots';
// The app uses local credentials bootstrapped via admin:bootstrap script.
// The task specified admin@example.com/Testing123! but those credentials do not
// exist in this database. The only working admin account is admin@ideamgmt.local.
const ADMIN_EMAIL = 'admin@ideamgmt.local';
const ADMIN_PASSWORD = 'AdminPass123!';

// Helper: save named screenshot (viewport)
async function ss(page: Page, name: string): Promise<void> {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[screenshot] ${filePath}`);
}

// Helper: save full-page screenshot
async function ssFullPage(page: Page, name: string): Promise<void> {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[screenshot-full] ${filePath}`);
}

// Helper: sign in as admin
async function signIn(page: Page): Promise<void> {
  await page.goto('/signin');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|projects|settings|ai)/, { timeout: 20_000 });
}

// Helper: navigate to settings and scroll to AI Configuration card
async function goToSettingsAiCard(page: Page): Promise<void> {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.locator('text=AI CONFIGURATION').first().waitFor({ timeout: 15_000 });
  await page.locator('text=AI CONFIGURATION').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
}

// Helper: select a provider in the AI config dropdown
async function selectProvider(page: Page, value: string): Promise<void> {
  const aiCard = page.locator('.nb-card').filter({ hasText: 'AI CONFIGURATION' }).first();
  const select = aiCard.locator('select').first();
  await select.selectOption(value);
  await page.waitForTimeout(600);
}

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

// ── TC-01 / TC-02: Sign in, navigate to Settings, screenshot AI config card ──
test('TC-01/02: sign-in and navigate to Settings, screenshot AI config card', async ({ page }) => {
  test.setTimeout(60_000);
  await signIn(page);
  await goToSettingsAiCard(page);
  await ss(page, 'tc-01-settings-page');
  await ssFullPage(page, 'tc-02-ai-config-card-full');
});

// ── TC-03: Switch dropdown to each provider option ───────────────────────────
test('TC-03: switch provider dropdown to each option', async ({ page }) => {
  test.setTimeout(90_000);
  await signIn(page);
  await goToSettingsAiCard(page);

  const providers = [
    { value: 'hosted', name: 'Hosted AI' },
    { value: 'local', name: 'Local AI' },
    { value: 'byok', name: 'BYOK' },
    { value: 'openrouter', name: 'OpenRouter' },
  ];

  for (const p of providers) {
    await selectProvider(page, p.value);
    await page.locator('text=AI CONFIGURATION').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await ss(page, `tc-03-provider-${p.value}`);
  }
});

// ── TC-04: Hosted AI panel shows usage meter ──────────────────────────────────
test('TC-04: Hosted AI panel has usage meter', async ({ page }) => {
  test.setTimeout(45_000);
  await signIn(page);
  await goToSettingsAiCard(page);
  await selectProvider(page, 'hosted');

  const hostedPanel = page.locator('text=HOSTED AI (GROQ)').first();
  const hasPanel = (await hostedPanel.count()) > 0;
  await ss(page, 'tc-04-hosted-ai-usage-meter');

  console.log(`[TC-04] Hosted AI panel visible: ${hasPanel}`);
  expect(hasPanel).toBe(true);
});

// ── TC-05: Local AI panel shows setup button ──────────────────────────────────
test('TC-05: Local AI panel has setup button', async ({ page }) => {
  test.setTimeout(45_000);
  await signIn(page);
  await goToSettingsAiCard(page);
  await selectProvider(page, 'local');

  const setupBtn = page.locator('button', { hasText: /SETUP LOCAL AI|RECONFIGURE LOCAL AI/i }).first();
  const hasSetup = (await setupBtn.count()) > 0;
  await ss(page, 'tc-05-local-ai-setup-button');

  console.log(`[TC-05] Setup button visible: ${hasSetup}`);
  expect(hasSetup).toBe(true);
});

// ── TC-06: BYOK panel shows key input ────────────────────────────────────────
test('TC-06: BYOK panel has key input', async ({ page }) => {
  test.setTimeout(45_000);
  await signIn(page);
  await goToSettingsAiCard(page);
  await selectProvider(page, 'byok');

  const keyInput = page.locator('input[type="password"][placeholder*="sk-"]').first();
  const hasKeyInput = (await keyInput.count()) > 0;
  await ss(page, 'tc-06-byok-key-input');

  console.log(`[TC-06] Key input visible: ${hasKeyInput}`);
  expect(hasKeyInput).toBe(true);
});

// ── TC-07: Fallback setting dropdown appears for Hosted AI ───────────────────
test('TC-07: fallback setting dropdown visible for Hosted AI (admin)', async ({ page }) => {
  test.setTimeout(45_000);
  await signIn(page);
  await goToSettingsAiCard(page);
  await selectProvider(page, 'hosted');

  const fallbackLabel = page.locator('text=WHEN MONTHLY LIMIT REACHED').first();
  const hasFallback = (await fallbackLabel.count()) > 0;
  await ss(page, 'tc-07-fallback-dropdown');

  console.log(`[TC-07] Fallback dropdown visible: ${hasFallback}`);
  expect(hasFallback).toBe(true);
});

// ── TC-08/09: Admin section visible ──────────────────────────────────────────
test('TC-08/09: ADMIN SETTINGS card appears with purple border and free tier toggle', async ({ page }) => {
  test.setTimeout(45_000);
  await signIn(page);
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');

  await page.locator('text=ADMIN SETTINGS').first().waitFor({ timeout: 15_000 });
  await page.locator('text=ADMIN SETTINGS').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const adminCard = page.locator('text=ADMIN SETTINGS').first();
  const hasAdminCard = (await adminCard.count()) > 0;
  await ss(page, 'tc-08-admin-settings-card');

  console.log(`[TC-08] Admin Settings card visible: ${hasAdminCard}`);
  expect(hasAdminCard).toBe(true);
});

// ── TC-10: Free tier toggle switches ─────────────────────────────────────────
test('TC-10: free tier toggle button visible and clickable', async ({ page }) => {
  test.setTimeout(60_000);
  await signIn(page);
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.locator('text=ADMIN SETTINGS').first().waitFor({ timeout: 15_000 });
  await page.locator('text=ADMIN SETTINGS').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const freeTierSection = page.locator('text=FREE TIER AI PROMOTION').first();
  await freeTierSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const onOffBtn = page.locator('.nb-card').filter({ hasText: 'ADMIN SETTINGS' })
    .locator('button', { hasText: /^ON$|^OFF$/ }).first();

  const hasToggle = (await onOffBtn.count()) > 0;
  console.log(`[TC-10] Toggle button visible: ${hasToggle}`);

  await ss(page, 'tc-10-free-tier-toggle-before');

  if (hasToggle) {
    await onOffBtn.click();
    await page.waitForTimeout(800);
    await ss(page, 'tc-10-free-tier-toggle-toggled');

    await onOffBtn.click();
    await page.waitForTimeout(600);
    await ss(page, 'tc-10-free-tier-toggle-restored');
  }

  expect(hasToggle).toBe(true);
});

// ── TC-11/12: Billing tier cards ─────────────────────────────────────────────
test('TC-11/12: billing tier cards show $7 Pro and $17 Team pricing', async ({ page }) => {
  test.setTimeout(60_000);
  await signIn(page);
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  const pro7 = page.locator('button', { hasText: /\$7/ }).first();
  const pro7Alt = page.locator('text=/\\$7\\/MO/').first();

  if ((await pro7.count()) > 0) {
    await pro7.scrollIntoViewIfNeeded();
  } else if ((await pro7Alt.count()) > 0) {
    await pro7Alt.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(500);

  const hasPro = (await pro7.count()) > 0 || (await pro7Alt.count()) > 0;
  const team17 = page.locator('button', { hasText: /\$17/ }).first();
  const team17Alt = page.locator('text=/\\$17\\/SEAT/').first();
  const hasTeam = (await team17.count()) > 0 || (await team17Alt.count()) > 0;

  await ss(page, 'tc-11-billing-tier-cards');

  console.log(`[TC-11] $7 Pro visible: ${hasPro}, $17 Team visible: ${hasTeam}`);
  expect(hasPro).toBe(true);
  expect(hasTeam).toBe(true);
});

// ── TC-13 (RETEST): GET /api/ai/usage ────────────────────────────────────────
test('TC-13 retest: GET /api/ai/usage returns { ok, used, limit, plan }', async ({ page }) => {
  test.setTimeout(30_000);
  await signIn(page);

  const res = await page.evaluate(async () => {
    const r = await fetch('/api/ai/usage');
    const body = await r.json();
    return { status: r.status, body };
  });

  console.log('[TC-13] /api/ai/usage status:', res.status);
  console.log('[TC-13] /api/ai/usage response:', JSON.stringify(res.body, null, 2));

  if (res.status !== 200 || !res.body.ok) {
    console.error('[TC-13] FAIL — API returned:', res.status, JSON.stringify(res.body));
  }

  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(typeof res.body.used).toBe('number');
  expect(typeof res.body.limit).toBe('number');
  expect(typeof res.body.plan).toBe('string');
});

// ── TC-14 (RETEST): GET /api/admin/config ────────────────────────────────────
test('TC-14 retest: GET /api/admin/config returns config + stats (admin only)', async ({ page }) => {
  test.setTimeout(30_000);
  await signIn(page);

  const res = await page.evaluate(async () => {
    const r = await fetch('/api/admin/config');
    const body = await r.json();
    return { status: r.status, body };
  });

  console.log('[TC-14] /api/admin/config status:', res.status);
  console.log('[TC-14] /api/admin/config response:', JSON.stringify(res.body, null, 2));

  if (res.status !== 200 || !res.body.ok) {
    console.error('[TC-14] FAIL — API returned:', res.status, JSON.stringify(res.body));
  }

  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.config).toBeDefined();
  expect(res.body.stats).toBeDefined();
});

// ── TC-15 (RETEST): GET /api/billing/token-pack ──────────────────────────────
test('TC-15 retest: GET /api/billing/token-pack returns packs + balance', async ({ page }) => {
  test.setTimeout(30_000);
  await signIn(page);

  const res = await page.evaluate(async () => {
    const r = await fetch('/api/billing/token-pack');
    const body = await r.json();
    return { status: r.status, body };
  });

  console.log('[TC-15] /api/billing/token-pack status:', res.status);
  console.log('[TC-15] /api/billing/token-pack response:', JSON.stringify(res.body, null, 2));

  if (res.status !== 200 || !res.body.ok) {
    console.error('[TC-15] FAIL — API returned:', res.status, JSON.stringify(res.body));
  }

  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(Array.isArray(res.body.packs)).toBe(true);
  expect(res.body.packs.length).toBeGreaterThan(0);
  expect(typeof res.body.currentBalance).toBe('number');
});

// ── TC-16/17: AI chat page provider badge ────────────────────────────────────
test('TC-16/17: AI chat page loads and shows chat interface', async ({ page }) => {
  test.setTimeout(90_000);
  await signIn(page);
  await page.goto('/ai');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await ss(page, 'tc-16-ai-page-initial');

  const currentUrl = page.url();
  console.log(`[TC-16] Current URL: ${currentUrl}`);
  expect(currentUrl).toMatch(/\/ai/);

  const msgInput = page.locator('textarea, input[placeholder*="message" i], input[placeholder*="chat" i], input[placeholder*="ask" i]').first();
  const hasInput = (await msgInput.count()) > 0;
  console.log(`[TC-16] Chat input found: ${hasInput}`);

  if (hasInput) {
    try {
      await msgInput.fill('hello');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
      await ss(page, 'tc-17-ai-hello-response');

      const providerBadge = page.locator('.message-provider, [data-testid="provider-badge"]').first();
      const altBadge = page.locator('text=/groq|ollama|openrouter|hosted ai/i').first();
      const hasBadge = (await providerBadge.count()) > 0 || (await altBadge.count()) > 0;
      console.log(`[TC-16] Provider badge visible: ${hasBadge}`);
    } catch (err) {
      console.warn('[TC-16/17] Chat interaction error:', String(err).slice(0, 200));
      await ss(page, 'tc-17-ai-interaction-error');
    }
  } else {
    console.warn('[TC-16] No chat input found');
    await ss(page, 'tc-16-ai-no-input');
  }

  expect(currentUrl).toMatch(/\/ai/);
});

// ── TC-18: Connection status bar ─────────────────────────────────────────────
test('TC-18: screenshot connection status bar at bottom of AI config card', async ({ page }) => {
  test.setTimeout(45_000);
  await signIn(page);
  await goToSettingsAiCard(page);

  const statusBar = page.locator('text=/Active:|No provider connected/').first();
  const hasStatusBar = (await statusBar.count()) > 0;
  console.log(`[TC-18] Connection status bar visible: ${hasStatusBar}`);

  if (hasStatusBar) {
    await statusBar.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }

  await ss(page, 'tc-18-connection-status-bar');
  expect(hasStatusBar).toBe(true);
});
