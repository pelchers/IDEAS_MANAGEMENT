import { type Page, type APIRequestContext, expect } from '@playwright/test';

/**
 * Test credentials. The admin user should already exist
 * (bootstrapped via admin:bootstrap script).
 */
export const ADMIN_EMAIL = 'admin@ideamgmt.local';
export const ADMIN_PASSWORD = 'AdminPass123!';

/**
 * Unique email for signup tests. Uses timestamp to avoid collisions.
 */
export function uniqueEmail(): string {
  return `e2e-${Date.now()}@test.local`;
}

/**
 * Signs in via the API and sets cookies on the browser context.
 * This is the fastest way to authenticate before testing UI.
 */
export async function signInViaAPI(
  request: APIRequestContext,
  page: Page,
  email = ADMIN_EMAIL,
  password = ADMIN_PASSWORD
): Promise<void> {
  const response = await request.post('/api/auth/signin', {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();

  // Cookies are automatically set on the context by Playwright
  // because the request uses the same base URL.
  // Navigate to trigger cookie application.
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
}

/**
 * Signs in via the UI form.
 */
export async function signInViaUI(
  page: Page,
  email = ADMIN_EMAIL,
  password = ADMIN_PASSWORD
): Promise<void> {
  await page.goto('/signin');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
}

/**
 * Signs up a new user via the API.
 * Returns the response data.
 */
export async function signUpViaAPI(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<{ ok: boolean; user?: { id: string; email: string } }> {
  const response = await request.post('/api/auth/signup', {
    data: { email, password },
  });
  return response.json();
}

/**
 * Creates a project via the API.
 * Returns the project id.
 */
export async function createProjectViaAPI(
  request: APIRequestContext,
  name: string,
  description = ''
): Promise<string> {
  const response = await request.post('/api/projects', {
    data: { name, description },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data.project?.id ?? data.id;
}

/**
 * Waits for page to finish loading (no loading indicators).
 */
export async function waitForPageReady(page: Page): Promise<void> {
  // Wait for any loading indicators to disappear
  const loading = page.locator('.nb-loading');
  if (await loading.count() > 0) {
    await loading.first().waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }
  await page.waitForLoadState('networkidle');
}
