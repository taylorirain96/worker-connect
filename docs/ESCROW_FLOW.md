# Escrow flow (plain-English map)

## 1) Which route group is the “real” implementation?

- **Primary escrow API: `app/api/payments/escrow/*`**
  - `create/route.ts`, `release/route.ts`, `dispute/route.ts` contain full escrow actions (create, release, dispute).
  - They use `lib/services/escrowService.ts` (`createEscrowRecord`, `getEscrowById`, `updateEscrowStatus`) and the **`escrowPayments`** collection.
  - This is the clearest “business-logic” escrow implementation.

- **Proxy/wrapper layer: `app/api/escrow/*`**
  - `release/route.ts` is a thin wrapper used by the completion UI; it checks homeowner ownership, then forwards to `app/api/jobs/[jobId]/complete/route.ts`.
  - `auto-release/route.ts` is a cron/safety endpoint that auto-releases after dispute window expiry.
  - These routes mostly orchestrate existing logic and/or legacy documents in **`escrows`**.

- **Legacy/special Stripe endpoint: `app/api/stripe/create-escrow/route.ts`**
  - Creates a Stripe PaymentIntent directly.
  - In this repo it appears to be an older/standalone path (no active app callsites found), kept for compatibility/testing.

> Short version: **`/api/payments/escrow/*` = core escrow API**, **`/api/escrow/*` = wrapper/ops layer**, **`/api/stripe/create-escrow` = older direct Stripe path**.

## 2) Full lifecycle (creation → release or refund) with file paths

1. **Employer accepts quote (escrow creation starts)**
   - UI call: `app/dashboard/homeowner/page.tsx` (`handleAcceptQuote`)
   - API: `app/api/payments/escrow/create/route.ts`
   - Service: `lib/services/escrowService.ts#createEscrowRecord`
   - Result: Stripe PaymentIntent is created (`capture_method: 'manual'`) and escrow record is saved as `pending` (or `held` in mock mode). Job/quote are linked.

2. **Funds become held in escrow**
   - Webhook: `app/api/stripe/webhook/route.ts` (`payment_intent.succeeded` for `type=escrow`)
   - Service calls: `getEscrowByPaymentIntent` + `updateEscrowStatus(..., 'held')` in `lib/services/escrowService.ts`
   - Result: escrow is marked held, job moves to `workflowStage: deposit_secure`, notifications sent.
   - Note: webhook also has legacy fallback updates for `adminDb.collection('escrows')` (`in_escrow`).

3. **Job completion + release path**
   - Homeowner completion UI: `app/dashboard/jobs/[jobId]/complete/page.tsx`
   - Wrapper endpoint: `app/api/escrow/release/route.ts`
   - Delegated route: `app/api/jobs/[jobId]/complete/route.ts`
   - Result: job is marked completed, dispute deadline set, Stripe capture/transfer attempted, escrow/job statuses move to released/funds_released.
   - Alternative direct API: `app/api/payments/escrow/release/route.ts` (release by `escrowId`) also captures/transfers and marks released.

4. **Dispute path (if either side contests)**
   - API option A: `app/api/payments/escrow/dispute/route.ts`
   - API option B: `app/api/jobs/[jobId]/dispute/route.ts` (`POST`)
   - Service: `lib/services/escrowService.ts#openDispute`
   - Result: escrow/job move to `disputed`; funds frozen.

5. **Resolution: release or refund**
   - Admin resolve: `app/api/jobs/[jobId]/dispute/route.ts` (`PATCH`)
   - Service: `lib/services/escrowService.ts#resolveDispute`
   - Result:
     - `release_to_worker` → escrow `released`
     - `refund_to_employer` → escrow `refunded`
   - Related bookkeeping webhook: `app/api/stripe/webhook/route.ts` (`charge.refunded`) records refund data.

6. **Auto-release safety net**
   - Cron endpoint: `app/api/escrow/auto-release/route.ts`
   - Result: after dispute window expiry, remaining releasable escrows/jobs are marked released.
