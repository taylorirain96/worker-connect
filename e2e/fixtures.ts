/**
 * Shared fixture data for E2E tests.
 *
 * These constants are consumed by:
 *   - `e2e/globalSetup.ts` to seed accounts and Firestore documents in the
 *     Firebase emulator before the test run.
 *   - `e2e/revenue-path.spec.ts` (currently fixme) to mint signed session
 *     cookies and drive the homeowner ↔ worker flow.
 *
 * Keeping them in one module guarantees the seeded UIDs and the UIDs the
 * spec signs cookies for never drift apart.
 */

export const FIXTURE_PROJECT_ID = 'quicktrade-e2e';

export const HOMEOWNER_FIXTURE = {
  uid: 'e2e-homeowner-uid',
  email: 'homeowner.e2e@quicktrade.test',
  password: 'Passw0rd!homeowner',
  displayName: 'E2E Homeowner',
  role: 'homeowner' as const,
};

export const WORKER_FIXTURE = {
  uid: 'e2e-worker-uid',
  email: 'worker.e2e@quicktrade.test',
  password: 'Passw0rd!worker',
  displayName: 'E2E Worker',
  role: 'worker' as const,
};

/**
 * True when the Firebase emulator suite is configured for the current run.
 * Both vars are honored automatically by `firebase-admin`, so when they are
 * set the server (started by Playwright's webServer) talks to the emulator
 * instead of a real Firebase project.
 */
export function emulatorsConfigured(): boolean {
  return Boolean(
    process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST,
  );
}
