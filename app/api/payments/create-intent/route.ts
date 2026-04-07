import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'
import { BUNDLE_PRICING } from '@/types/payment'
import type { BundleType } from '@/types/payment'

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for a job payment.
 *
 * Supports Price Anchoring via the optional `bundleType` field:
 *   - 'single'  → $100 per job (no discount)
 *   - '3pack'   → $285 total ( 5 % savings = $5/job)
 *   - '10pack'  → $900 total (10 % savings = $10/job)
 *
 * When `bundleType` is supplied the `amount` field is ignored and the
 * canonical bundle price is used instead.
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
      bundleType?: BundleType
      moverModeApplied?: boolean
    }

    const {
      currency = 'usd',
      jobId,
      employerId,
      workerId,
      description,
      paymentMethod,
      bundleType,
      moverModeApplied = false,
    } = body

    let { amount } = body

    // paymentMethod is forwarded as a Stripe payment_method hint in production;
    // not required for PaymentIntent creation with automatic_payment_methods enabled.
    void paymentMethod

    // Apply bundle pricing when a bundleType is provided
    let bundlePricing = bundleType ? BUNDLE_PRICING.find((p) => p.bundleType === bundleType) : null
    if (bundleType) {
      if (!bundlePricing) {
        return NextResponse.json({ error: 'Invalid bundleType' }, { status: 400 })
      }
      amount = bundlePricing.totalPrice
    }

    if (!amount || !jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await createPaymentIntent({
      amount,
      currency,
      description,
      metadata: {
        jobId,
        employerId,
        workerId,
        bundleType: bundleType ?? 'single',
        moverModeApplied: String(moverModeApplied),
        ...(bundlePricing ? { savingsPercent: String(bundlePricing.savingsPercent) } : {}),
      },
    })

    return NextResponse.json({
      ...result,
      bundleType: bundleType ?? 'single',
      moverModeApplied,
      ...(bundlePricing
        ? {
            jobCount: bundlePricing.jobCount,
            savingsPerJob: bundlePricing.savingsPerJob,
            savingsPercent: bundlePricing.savingsPercent,
          }
        : {}),
    })
  } catch (error) {
    console.error('POST /api/payments/create-intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
