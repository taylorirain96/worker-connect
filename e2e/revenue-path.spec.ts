import { test } from '@playwright/test';

/**
 * Revenue path: post-job → quote → accept → escrow → release → review.
 *
 * This is the highest-value flow on the platform. The test is intentionally
 * marked `test.fixme` until the supporting harness lands:
 *
 *   1. Firebase emulator (auth + firestore) wired into `playwright.config.ts`
 *      via a `globalSetup` that seeds one homeowner + one worker account and
 *      tears the emulator down on exit.
 *   2. Stripe test-mode keys (or `stripe-mock`) so the escrow PaymentIntent
 *      + Connect transfer succeed deterministically. The webhook signing
 *      secret needs to be injected so `/api/stripe/webhook` accepts the
 *      simulated `payment_intent.succeeded` and `charge.refunded` events.
 *   3. A way to drive the worker-side accept and the homeowner-side
 *      release-of-funds from the same Playwright run (two browser contexts).
 *
 * See `docs/NEXT_UP.md` task #5 for the full acceptance criteria.
 */
test.fixme(
  'homeowner posts job, worker quotes, homeowner accepts → escrow → release → review',
  async () => {
    // Step 1 — sign in as homeowner, post a job via /jobs/create.
    // Step 2 — sign in as worker (second context), submit a quote via
    //          POST /api/quotes (or the quote page).
    // Step 3 — homeowner accepts the quote, pays escrow deposit via Stripe
    //          test card; webhook confirms `escrow_funded`.
    // Step 4 — worker marks the job complete; homeowner releases funds via
    //          POST /api/escrow/release.
    // Step 5 — homeowner leaves a review via POST /api/reviews; assert it
    //          appears on /workers/[id].
    //
    // Sign-in lives at `/auth/login` (not `/auth/signin`).
  },
);
