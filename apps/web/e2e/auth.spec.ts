import {
  test,
  expect,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  uniqueEmail,
  signInViaUI,
} from './helpers';

test.describe('Auth flows', () => {
  test('sign up with new email', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await expect(page.locator('h1')).toContainText('Sign Up');

    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(password);
    await page.getByTestId('signup-confirm').fill(password);
    await page.getByTestId('signup-submit').click();

    // Successful signup redirects to the dashboard.
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('sign in with valid credentials', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('h1')).toContainText('Sign In');

    await page.getByTestId('signin-email').fill(ADMIN_EMAIL);
    await page.getByTestId('signin-password').fill(ADMIN_PASSWORD);
    await page.getByTestId('signin-submit').click();

    await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
    // The dashboard heading confirms we landed on an authed page.
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
  });

  test('sign in with wrong password shows error', async ({ page }) => {
    await page.goto('/signin');

    await page.getByTestId('signin-email').fill(ADMIN_EMAIL);
    await page.getByTestId('signin-password').fill('WrongPassword999!');
    await page.getByTestId('signin-submit').click();

    await expect(page.getByTestId('auth-error')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('auth-error')).toContainText(/invalid/i);
  });

  test('sign out redirects to signin', async ({ page }) => {
    await signInViaUI(page);

    // The nav drawer starts closed (its off-screen button still reads "visible"
    // to Playwright), so open it via the hamburger, which only renders when closed.
    const hamburger = page.getByLabel('Open navigation menu');
    if (await hamburger.isVisible()) {
      await hamburger.click();
    }
    await page.getByTestId('signout-button').click();

    await page.waitForURL(/\/signin/, { timeout: 10_000 });
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('protected page redirects to signin without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/signin/, { timeout: 10_000 });
  });
});
