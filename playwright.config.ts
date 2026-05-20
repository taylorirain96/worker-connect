import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for QuickTrade E2E tests.
 *
 * Scope (initial): smoke tests against the built Next.js app (no Firebase,
 * Stripe, or auth required). The full revenue-path test
 * (`e2e/revenue-path.spec.ts`) is currently marked `test.fixme` until a
 * Firebase emulator + Stripe test-mode fixture is wired up — see
 * `docs/NEXT_UP.md` task #5.
 */

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // Fail the build on CI if `test.only` is left in source.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the built Next.js server. Skip if a server is already running so
  // local devs can point at `npm run dev`.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
