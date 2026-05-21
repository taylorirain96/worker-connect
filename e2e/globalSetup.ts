import type { FullConfig } from '@playwright/test';
import {
  FIXTURE_PROJECT_ID,
  HOMEOWNER_FIXTURE,
  WORKER_FIXTURE,
  emulatorsConfigured,
} from './fixtures';

/**
 * Playwright `globalSetup`: seed the Firebase emulator with the fixture
 * accounts the revenue-path E2E test (`e2e/revenue-path.spec.ts`) needs.
 *
 * This is a no-op unless both `FIRESTORE_EMULATOR_HOST` and
 * `FIREBASE_AUTH_EMULATOR_HOST` are set, so existing smoke / auth-middleware
 * specs (which don't need Firebase) keep running in CI without the
 * emulator (and without needing a Java runtime).
 *
 * When emulator env vars *are* present this:
 *   1. Wipes any state left over from a previous run via the emulator's REST
 *      reset endpoints.
 *   2. Creates the homeowner + worker fixture accounts in Auth Emulator with
 *      deterministic UIDs (via firebase-admin, which auto-honors
 *      `FIREBASE_AUTH_EMULATOR_HOST`).
 *   3. Mirrors their profile docs into Firestore under `users/{uid}` so the
 *      role-aware dashboards render.
 *
 * Tracks `docs/NEXT_UP.md` task #5.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  if (!emulatorsConfigured()) {
    // Skip silently: tests that need fixtures should `test.skip` themselves
    // when `emulatorsConfigured()` is false.
    return;
  }

  const projectId =
    process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? FIXTURE_PROJECT_ID;
  process.env.GCLOUD_PROJECT = projectId;
  process.env.GOOGLE_CLOUD_PROJECT = projectId;

  await resetEmulator(projectId);

  // Imported lazily so the rest of the test suite doesn't pay the
  // firebase-admin require cost when emulators aren't in play.
  const admin = await import('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  const auth = admin.auth();
  const db = admin.firestore();
  const now = new Date();

  for (const fixture of [HOMEOWNER_FIXTURE, WORKER_FIXTURE]) {
    await auth.createUser({
      uid: fixture.uid,
      email: fixture.email,
      password: fixture.password,
      displayName: fixture.displayName,
      emailVerified: true,
    });

    await db.collection('users').doc(fixture.uid).set({
      uid: fixture.uid,
      email: fixture.email,
      displayName: fixture.displayName,
      role: fixture.role,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Drop all auth + firestore state in the running emulator. Uses the emulator
 * REST API so we don't have to depend on `firebase-tools`.
 */
async function resetEmulator(projectId: string): Promise<void> {
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST!;
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST!;

  const endpoints = [
    `http://${authHost}/emulator/v1/projects/${projectId}/accounts`,
    `http://${firestoreHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
  ];

  for (const url of endpoints) {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 200) {
      throw new Error(
        `Failed to reset Firebase emulator at ${url}: ${res.status} ${res.statusText}`,
      );
    }
  }
}
