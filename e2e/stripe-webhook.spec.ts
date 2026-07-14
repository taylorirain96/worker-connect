import { expect, test } from '@playwright/test';
import Stripe from 'stripe';
import { HOMEOWNER_FIXTURE, WORKER_FIXTURE, emulatorsConfigured } from './fixtures';

/**
 * Stripe webhook route E2E tests.
 *
 * These tests construct properly HMAC-signed Stripe webhook event payloads
 * using Stripe's test signing helpers, POST them directly to
 * `app/api/stripe/webhook/route.ts`, and assert the expected Firestore
 * state changes occur — exercising the webhook's event-parsing paths
 * independently of the UI-driven revenue flow in `revenue-path.spec.ts`.
 *
 * Requires the Firebase emulator harness (same guard as revenue-path.spec.ts).
 * Run via `npm run test:e2e:emulators`.
 *
 * The deprecated `/api/webhooks/stripe` endpoint is also confirmed to return
 * 410 (and not silently swallow events) in a dedicated test below.
 *
 * Tracks `docs/NEXT_UP.md` task #5.
 */

const skipReason =
  'Firebase emulator suite is not configured (set FIRESTORE_EMULATOR_HOST + FIREBASE_AUTH_EMULATOR_HOST, or run `npm run test:e2e:emulators`).';

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a signed Stripe-webhook `stripe-signature` header for `body`.
 * Uses `stripe.webhooks.generateTestHeaderString` which performs a local
 * HMAC-SHA256 computation — no real Stripe API call is made.
 */
function signWebhookPayload(body: string, webhookSecret: string): string {
  // The Stripe SDK only needs a format-valid key for local webhook helpers;
  // `sk_test_mock_e2e` satisfies the `sk_test_*` format requirement.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock_e2e', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2026-06-24.dahlia' as any,
  });
  return stripe.webhooks.generateTestHeaderString({ payload: body, secret: webhookSecret });
}

/** POST a signed webhook event to `/api/stripe/webhook` and return the response. */
async function postWebhook(
  request: import('@playwright/test').APIRequestContext,
  event: Record<string, unknown>,
): Promise<import('@playwright/test').APIResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_e2e_test';
  const body = JSON.stringify(event);
  const signature = signWebhookPayload(body, webhookSecret);
  return request.post('/api/stripe/webhook', {
    data: body,
    headers: {
      'content-type': 'application/json',
      'stripe-signature': signature,
    },
  });
}

/** Construct a minimal but valid-shaped Stripe event envelope. */
function makeEvent(type: string, dataObject: Record<string, unknown>): Record<string, unknown> {
  return {
    id: `evt_e2e_${type.replace(/\./g, '_')}_${Date.now()}`,
    object: 'event',
    api_version: '2026-06-24',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type,
    data: { object: dataObject },
  };
}

// ─── tests ───────────────────────────────────────────────────────────────────

test.describe('Stripe webhook route (/api/stripe/webhook)', () => {
  test.skip(!emulatorsConfigured(), skipReason);

  test(
    'payment_intent.succeeded (type=escrow) → escrow record held + job deposit_secure',
    async ({ request }) => {
      // ── seed Firestore fixtures ─────────────────────────────────────────
      const admin = await import('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'quicktrade-e2e',
        });
      }
      const db = admin.firestore();

      const ts = Date.now();
      const jobId = `wh-e2e-job-pi-${ts}`;
      const paymentIntentId = `pi_test_wh_escrow_${ts}`;
      const now = new Date().toISOString();

      await db.collection('jobs').doc(jobId).set({
        title: 'Webhook E2E escrow test job',
        status: 'open',
        escrowStatus: 'pending',
        employerId: HOMEOWNER_FIXTURE.uid,
        workerId: WORKER_FIXTURE.uid,
        createdAt: now,
        updatedAt: now,
      });

      const escrowRef = await db.collection('escrowPayments').add({
        jobId,
        employerId: HOMEOWNER_FIXTURE.uid,
        workerId: WORKER_FIXTURE.uid,
        amount: 400,
        currency: 'nzd',
        status: 'pending',
        stripePaymentIntentId: paymentIntentId,
        createdAt: now,
        updatedAt: now,
      });

      // ── POST signed webhook ─────────────────────────────────────────────
      const event = makeEvent('payment_intent.succeeded', {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 40000,
        currency: 'nzd',
        status: 'succeeded',
        metadata: {
          type: 'escrow',
          jobId,
          employerId: HOMEOWNER_FIXTURE.uid,
          workerId: WORKER_FIXTURE.uid,
        },
        last_payment_error: null,
      });

      const resp = await postWebhook(request, event);
      expect(resp.status(), await resp.text()).toBe(200);
      expect((await resp.json() as { received: boolean }).received).toBe(true);

      // ── assert Firestore state ──────────────────────────────────────────
      const escrowSnap = await escrowRef.get();
      expect(escrowSnap.data()?.status, 'escrow status should be held').toBe('held');

      const jobSnap = await db.collection('jobs').doc(jobId).get();
      const jobData = jobSnap.data() ?? {};
      expect(jobData.escrowStatus, 'job escrowStatus should be held').toBe('held');
      expect(jobData.workflowStage, 'job workflowStage should be deposit_secure').toBe(
        'deposit_secure',
      );
    },
  );

  test(
    'charge.refunded → payment record status=refunded + refund document created',
    async ({ request }) => {
      // ── seed Firestore fixtures ─────────────────────────────────────────
      const admin = await import('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'quicktrade-e2e',
        });
      }
      const db = admin.firestore();

      const ts = Date.now();
      const paymentId = `pay_e2e_wh_refund_${ts}`;
      const chargeId = `ch_e2e_wh_${ts}`;
      const refundId = `re_e2e_wh_${ts}`;
      const now = new Date().toISOString();

      await db.collection('payments').doc(paymentId).set({
        status: 'succeeded',
        amount: 40000,
        currency: 'nzd',
        createdAt: now,
        updatedAt: now,
      });

      // ── POST signed webhook ─────────────────────────────────────────────
      const event = makeEvent('charge.refunded', {
        id: chargeId,
        object: 'charge',
        amount: 40000,
        amount_refunded: 40000,
        currency: 'nzd',
        metadata: { paymentId },
        refunds: {
          object: 'list',
          data: [
            {
              id: refundId,
              object: 'refund',
              amount: 40000,
              currency: 'nzd',
              charge: chargeId,
              reason: 'requested_by_customer',
              status: 'succeeded',
            },
          ],
        },
      });

      const resp = await postWebhook(request, event);
      expect(resp.status(), await resp.text()).toBe(200);
      expect((await resp.json() as { received: boolean }).received).toBe(true);

      // ── assert Firestore state ──────────────────────────────────────────
      const paymentSnap = await db.collection('payments').doc(paymentId).get();
      expect(
        paymentSnap.data()?.status,
        'payment status should be refunded',
      ).toBe('refunded');

      const refundQuery = await db
        .collection('refunds')
        .where('stripeRefundId', '==', refundId)
        .limit(1)
        .get();
      expect(refundQuery.empty, 'a refund document should be created').toBe(false);

      const refundData = refundQuery.docs[0].data();
      expect(refundData.stripeChargeId).toBe(chargeId);
      expect(refundData.paymentId).toBe(paymentId);
      expect(refundData.status).toBe('completed');
      expect(refundData.amount).toBe(400); // 40000 cents → 400.00 dollars
    },
  );

  test('missing stripe-signature header → 400', async ({ request }) => {
    const resp = await request.post('/api/stripe/webhook', {
      data: JSON.stringify({ id: 'evt_bad', type: 'test' }),
      headers: { 'content-type': 'application/json' },
    });
    expect(resp.status()).toBe(400);
  });

  test('tampered payload (wrong signature) → 400', async ({ request }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_e2e_test';
    const body = JSON.stringify(makeEvent('payment_intent.succeeded', { id: 'pi_bad' }));
    // Sign with a *different* secret to trigger verification failure
    const badSignature = signWebhookPayload(body, webhookSecret + '_wrong');
    const resp = await request.post('/api/stripe/webhook', {
      data: body,
      headers: {
        'content-type': 'application/json',
        'stripe-signature': badSignature,
      },
    });
    expect(resp.status()).toBe(400);
  });
});

test.describe('Deprecated webhook endpoint (/api/webhooks/stripe)', () => {
  test('returns 410 Gone', async ({ request }) => {
    const resp = await request.post('/api/webhooks/stripe', {
      data: '{}',
      headers: { 'content-type': 'application/json' },
    });
    expect(resp.status()).toBe(410);
  });
});
