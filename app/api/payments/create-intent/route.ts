import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'
import { BUNDLE_OPTIONS, SINGLE_JOB_PRICE_CENTS } from '@/types/payment'
import type { BundleType } from '@/types/payment'

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for a job payment.
 *
 * Bundle pricing (Price Anchoring):
 *   single  → $100 per job (no discount)
 *   3pack   → $285 total  ($95/job, 5% off)
 *   10pack  → $900 total  ($90/job, 10% off)
 *
 * If `bundleType` is supplied the `amount` field is ignored and the canonical
 * bundle price is used instead.  Otherwise the caller-supplied `amount` (in
 * cents) is used as before.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      amount?: number
      currency?: string
      jobId?: string
      employerId?: string
      workerId?: string
      description?: string
      paymentMethod?: string
      /** Price-anchoring bundle selection */
      bundleType?: BundleType
      /** Whether this payment has a Mover Mode premium applied */
      moverModeApplied?: boolean
    }

    const {
      amount,
      currency = 'usd',
      jobId,
      employerId,
      workerId,
      description,
      paymentMethod,
      bundleType,
      moverModeApplied = false,
    } = body

    // paymentMethod is forwarded as a Stripe payment_method hint in production;
    // not required for PaymentIntent creation with automatic_payment_methods enabled.
    void paymentMethod

    if (!jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Price Anchoring: resolve bundle amount ─────────────────────────────
    let resolvedAmount: number
    let resolvedBundleType: BundleType = 'single'

    if (bundleType && bundleType !== 'single') {
      const bundle = BUNDLE_OPTIONS.find((b) => b.type === bundleType)
      if (!bundle) {
        return NextResponse.json({ error: 'Invalid bundleType' }, { status: 400 })
      }
      resolvedAmount = bundle.totalCents
      resolvedBundleType = bundle.type
    } else if (amount) {
      resolvedAmount = amount
      resolvedBundleType = 'single'
    } else {
      // Default to single job price
      resolvedAmount = SINGLE_JOB_PRICE_CENTS
      resolvedBundleType = 'single'
    }

    const result = await createPaymentIntent({
      amount: resolvedAmount,
      currency,
      description,
      metadata: {
        jobId,
        employerId,
        workerId,
        bundleType: resolvedBundleType,
        moverModeApplied: String(moverModeApplied),
      },
    })

    return NextResponse.json({
      ...result,
      bundleType: resolvedBundleType,
      moverModeApplied,
    })
  } catch (error) {
    console.error('POST /api/payments/create-intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
