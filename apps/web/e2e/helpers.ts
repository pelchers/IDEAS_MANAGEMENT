import {
  test as base,
  expect,
  type Page,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type TestInfo,
} from '@playwright/test';

/**
 * Test credentials. The admin user should already exist
 * (bootstrapped via admin:bootstrap script).
 */
export const ADMIN_EMAIL = 'admin@ideamgmt.local';
export const ADMIN_PASSWORD = 'AdminPass123!';

/**
 * Auth sign-in/sign-up is rate limited to 5 attempts / 15 min PER IP, and the
 * limiter keys on the X-Forwarded-For header (falling back to "unknown" for
 * header-less localhost requests). When the whole suite runs from one machine,
 * every request shares the `unknown` bucket and the suite throttles ITSELF.
 *
 * Fix: give every test context a UNIQUE synthetic client IP. Each test then
 * gets its own fresh rate-limit bucket — rate limiting stays fully ON (we still
 * exercise the real code path), but tests no longer collide. This needs no
 * server-side changes and works against any running server.
 */
function ipForTest(testInfo: TestInfo): string {
  // Deterministic, collision-free across workers + tests within a run.
  const n = testInfo.workerIndex * 100000 + testInfo.testId.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 90000;
  return `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`;
}

export function uniqueIp(seed = 0): string {
  const n = (Date.now() + seed * 7919) >>> 0;
  return `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${(n & 255) || 1}`;
}

/**
 * A browser context pre-seeded with a unique client IP header. Use this when a
 * spec creates its own contexts (e.g. multi-user journeys) so each simulated
 * user comes from a distinct IP and gets its own rate-limit bucket.
 */
export async function newUserContext(browser: Browser, seed = 0): Promise<BrowserContext> {
  return browser.newContext({ extraHTTPHeaders: { 'X-Forwarded-For': uniqueIp(seed) } });
}

/**
 * An API request context with a unique client IP header (for API-only flows).
 */
export async function newApiContext(
  playwright: { request: { newContext: (opts: Record<string, unknown>) => Promise<APIRequestContext> } },
  baseURL: string | undefined,
  seed = 0
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { 'X-Forwarded-For': uniqueIp(seed) },
  });
}

/**
 * Extended `test` — every context/request fixture carries a unique client IP so
 * tests don't share (and exhaust) a single rate-limit bucket. Specs should
 * `import { test, expect } from './helpers'` instead of '@playwright/test'.
 */
export const test = base.extend({
  context: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'X-Forwarded-For': ipForTest(testInfo) },
    });
    await use(context);
    await context.close();
  },
  request: async ({ playwright, baseURL }, use, testInfo) => {
    const request = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'X-Forwarded-For': ipForTest(testInfo) },
    });
    await use(request);
    await request.dispose();
  },
});

export { expect };

/**
 * Unique email for signup tests. Uses timestamp to avoid collisions.
 */
export function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;
}

/**
 * Waits for the page to be interactive. Deliberately does NOT use
 * `networkidle` — the app holds an always-on notification SSE connection open,
 * so the network never goes idle and `networkidle` waits time out. Instead we
 * wait for DOM content + any loading indicator to clear.
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  const loading = page.locator('.nb-loading');
  if (await loading.count() > 0) {
    await loading.first().waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }
}

/**
 * Signs in via the API using the PAGE's own request context (shares the cookie
 * jar with the browser page AND inherits the context's unique client-IP header).
 */
export async function signInViaAPI(
  _request: APIRequestContext,
  page: Page,
  email = ADMIN_EMAIL,
  password = ADMIN_PASSWORD
): Promise<void> {
  const response = await page.request.post('/api/auth/signin', {
    data: { email, password },
  });
  expect(response.ok(), `signin failed (${response.status()})`).toBeTruthy();
  await page.goto('/dashboard');
  await waitForPageReady(page);
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
  await page.getByTestId('signin-email').fill(email);
  await page.getByTestId('signin-password').fill(password);
  await page.getByTestId('signin-submit').click();
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
}

/**
 * Signs up a new user via the API.
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
