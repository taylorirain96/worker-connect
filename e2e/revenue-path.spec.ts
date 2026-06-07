import { expect, test, type APIRequestContext } from '@playwright/test';
import { createSessionToken } from '../lib/auth/sessionToken';
import {
  HOMEOWNER_FIXTURE,
  WORKER_FIXTURE,
  emulatorsConfigured,
} from './fixtures';

/**
 * Revenue path: post-job → quote → accept → escrow → release → review.
 *
 * The end-to-end version of the platform's most important flow. The test
 * requires the Firebase emulator suite (auth + firestore); the harness in
 * `e2e/globalSetup.ts` seeds the fixture homeowner + worker accounts. Run
 * via `npm run test:e2e:emulators`, or the dedicated `revenue-path` CI job
 * in `.github/workflows/e2e.yml`.
 *
 * Stripe is forced into mock mode during emulator runs (`STRIPE_MODE=mock` in
 * Playwright config + CI), so no live endpoint is hit while this spec still
 * exercises escrow create + release transitions.
 */

const SESSION_COOKIE = 'auth-session';

const skipReason =
  'Firebase emulator suite is not configured (set FIRESTORE_EMULATOR_HOST + FIREBASE_AUTH_EMULATOR_HOST, or run `npm run test:e2e:emulators`).';

test.describe('revenue path', () => {
  test.skip(!emulatorsConfigured(), skipReason);

  test('homeowner posts job, worker quotes, homeowner accepts → escrow → release → review', async ({
    browser,
    request,
  }) => {
    // ── 1. Two browser contexts, one per fixture user ──────────────────────
    const [homeownerCookie, workerCookie] = await Promise.all([
      createSessionToken(HOMEOWNER_FIXTURE.uid, HOMEOWNER_FIXTURE.role),
      createSessionToken(WORKER_FIXTURE.uid, WORKER_FIXTURE.role),
    ]);

    const baseURL = test.info().project.use.baseURL ?? request.url('/');
    const url = new URL(baseURL);
    const cookieDomain = url.hostname;

    const homeownerContext = await browser.newContext();
    const workerContext = await browser.newContext();
    try {
      await Promise.all([
        homeownerContext.addCookies([
          {
            name: SESSION_COOKIE,
            value: homeownerCookie,
            domain: cookieDomain,
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
          },
        ]),
        workerContext.addCookies([
          {
            name: SESSION_COOKIE,
            value: workerCookie,
            domain: cookieDomain,
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
          },
        ]),
      ]);

      const homeowner = homeownerContext.request;
      const worker = workerContext.request;

      // ── 2. Homeowner posts a job ─────────────────────────────────────────
      const jobTitle = `E2E Revenue Path ${Date.now()}`;
      const jobBudget = 500;
      const jobResp = await postJSON(homeowner, '/api/jobs', {
        title: jobTitle,
        description: 'End-to-end revenue path test job. Please ignore.',
        category: 'plumbing',
        location: 'Auckland, NZ',
        budget: jobBudget,
        budgetType: 'fixed',
        urgency: 'medium',
        skills: ['plumbing'],
        employerId: HOMEOWNER_FIXTURE.uid,
        employerName: HOMEOWNER_FIXTURE.displayName,
      });
      expect(jobResp.status(), await jobResp.text()).toBe(201);
      const job = (await jobResp.json()) as { id: string; status: string };
      expect(job.id).toBeTruthy();
      const jobId = job.id;

      // ── 3. Worker submits a quote ────────────────────────────────────────
      const quoteAmount = 400;
      const quoteResp = await postJSON(
        worker,
        '/api/quotes',
        {
          jobId,
          jobTitle,
          employerId: HOMEOWNER_FIXTURE.uid,
          workerId: WORKER_FIXTURE.uid,
          workerName: WORKER_FIXTURE.displayName,
          basePrice: quoteAmount,
          description: 'Fixed price quote for the requested work.',
          timeline: '2 days',
          availability: 'this week',
        },
        WORKER_FIXTURE.uid,
      );
      expect(quoteResp.status(), await quoteResp.text()).toBe(201);
      const quote = (await quoteResp.json()) as { id: string; totalPrice: number };
      expect(quote.id).toBeTruthy();
      expect(quote.totalPrice).toBe(quoteAmount);
      const quoteId = quote.id;

      // ── 4. Homeowner accepts the quote ───────────────────────────────────
      const acceptResp = await fetchJSON(homeowner, '/api/quotes/' + quoteId, {
        method: 'PUT',
        body: { status: 'accepted' },
        userId: HOMEOWNER_FIXTURE.uid,
      });
      expect(acceptResp.status(), await acceptResp.text()).toBe(200);

      // ── 5. Create escrow payment intent (mock Stripe) ─────────────────────
      const escrowResp = await postJSON(homeowner, '/api/payments/escrow/create', {
        jobId,
        quoteId,
        employerId: HOMEOWNER_FIXTURE.uid,
        workerId: WORKER_FIXTURE.uid,
        amount: quoteAmount,
        completedJobs: 0,
      });
      expect(escrowResp.status(), await escrowResp.text()).toBe(200);
      const escrowBody = (await escrowResp.json()) as {
        escrowId: string;
        paymentIntentId: string;
        mockMode?: boolean;
        workerAmount: number;
        commissionAmount: number;
        commissionRate: number;
      };
      expect(escrowBody.escrowId).toBeTruthy();
      expect(escrowBody.paymentIntentId).toContain('pi_mock_');
      expect(escrowBody.mockMode).toBe(true);

      // ── 6. Transition job to in_progress ───────────────────────────────────
      const admin = await import('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'quicktrade-e2e',
        });
      }
      const db = admin.firestore();
      const nowIso = new Date().toISOString();

      await db.collection('jobs').doc(jobId).update({
        status: 'in_progress',
        escrowStatus: 'held',
        assignedWorkerId: WORKER_FIXTURE.uid,
        updatedAt: nowIso,
      });

      // ── 7. Homeowner releases escrow ──────────────────────────────────────
      const releaseResp = await postJSON(homeowner, '/api/payments/escrow/release', {
        escrowId: escrowBody.escrowId,
        releasedBy: HOMEOWNER_FIXTURE.uid,
      });
      expect(releaseResp.status(), await releaseResp.text()).toBe(200);
      const releaseBody = (await releaseResp.json()) as {
        success: boolean;
        jobId: string;
        workerAmount: number;
        commissionAmount: number;
        commissionRate: number;
      };
      expect(releaseBody.success).toBe(true);
      expect(releaseBody.jobId).toBe(jobId);
      expect(releaseBody.workerAmount).toBeCloseTo(escrowBody.workerAmount, 2);
      expect(releaseBody.commissionAmount).toBeCloseTo(escrowBody.commissionAmount, 2);
      expect(releaseBody.commissionRate).toBe(escrowBody.commissionRate);

      // The job document itself is now completed + escrow released
      const jobSnap = await db.collection('jobs').doc(jobId).get();
      const jobAfter = jobSnap.data() ?? {};
      expect(jobAfter.status).toBe('completed');
      expect(jobAfter.escrowStatus).toBe('released');

      // ── 8. Homeowner leaves a review ─────────────────────────────────────
      const reviewResp = await postJSON(homeowner, '/api/reviews', {
        jobId,
        reviewerId: HOMEOWNER_FIXTURE.uid,
        revieweeId: WORKER_FIXTURE.uid,
        rating: 5,
        comment: 'Great work — finished on time, would hire again. (E2E test)',
        tags: ['punctual', 'professional'],
        reviewerName: HOMEOWNER_FIXTURE.displayName,
      });
      expect(reviewResp.status(), await reviewResp.text()).toBe(201);
      const review = (await reviewResp.json()) as { id: string; rating: number };
      expect(review.id).toBeTruthy();
      expect(review.rating).toBe(5);

      // ── 9. Review is queryable for the worker ────────────────────────────
      const listResp = await homeowner.get(`/api/reviews?workerId=${WORKER_FIXTURE.uid}`);
      expect(listResp.status()).toBe(200);
      const list = (await listResp.json()) as { reviews: Array<{ jobId: string }> };
      const found = list.reviews.find((r) => r.jobId === jobId);
      expect(found, `review for job ${jobId} should be present on /api/reviews`).toBeTruthy();
    } finally {
      await Promise.all([homeownerContext.close(), workerContext.close()]);
    }
  });
});

// ─── helpers ────────────────────────────────────────────────────────────────

async function postJSON(
  request: APIRequestContext,
  path: string,
  body: unknown,
  userId?: string,
) {
  return request.post(path, {
    data: body,
    headers: userId ? { 'x-user-id': userId, 'content-type': 'application/json' } : { 'content-type': 'application/json' },
  });
}

async function fetchJSON(
  request: APIRequestContext,
  path: string,
  opts: { method: 'PUT' | 'POST' | 'DELETE'; body?: unknown; userId?: string },
) {
  return request.fetch(path, {
    method: opts.method,
    data: opts.body,
    headers: {
      'content-type': 'application/json',
      ...(opts.userId ? { 'x-user-id': opts.userId } : {}),
    },
  });
}
