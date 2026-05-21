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

// Default a deterministic signing secret for the `auth-session` cookie so that
// the test process (which mints cookies via `lib/auth/sessionToken`) and the
// Next.js server (which verifies them in `middleware.ts`) share a key. Real
// deployments must override this via the environment.
const AUTH_SESSION_SECRET =
  process.env.AUTH_SESSION_SECRET ?? 'e2e-test-secret-do-not-use-in-production';
process.env.AUTH_SESSION_SECRET = AUTH_SESSION_SECRET;

export default defineConfig({
  testDir: './e2e',
  // Fail the build on CI if `test.only` is left in source.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Seeds Firebase emulator fixtures when `FIRESTORE_EMULATOR_HOST` /
  // `FIREBASE_AUTH_EMULATOR_HOST` are set; no-op otherwise.
  globalSetup: require.resolve('./e2e/globalSetup'),
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
        env: {
          AUTH_SESSION_SECRET,
          // Forward emulator hosts so the Next.js server (and firebase-admin
          // inside it) connect to the emulator instead of real Firebase when
          // the harness is in use. Both vars are auto-honored by
          // firebase-admin and by the client SDK (via `NEXT_PUBLIC_USE_FIREBASE_EMULATOR`).
          ...(process.env.FIRESTORE_EMULATOR_HOST
            ? { FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST }
            : {}),
          ...(process.env.FIREBASE_AUTH_EMULATOR_HOST
            ? { FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST }
            : {}),
          ...(process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR
            ? { NEXT_PUBLIC_USE_FIREBASE_EMULATOR: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR }
            : {}),
          ...(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            ? { NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }
            : {}),
        },
      },
});
