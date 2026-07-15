import { defineConfig } from '@playwright/test';

// Base URL is env-configurable so the suite can target a non-default port when
// another dev server occupies :3000 (e.g. a sibling app). Defaults to :3000.
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  webServer: {
    command: 'npx next dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
