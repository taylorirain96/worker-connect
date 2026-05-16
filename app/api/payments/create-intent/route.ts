import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'
import { BUNDLE_PRICING } from '@/types/payment'
import { getPostingFee } from '@/types'
import type { BundleType } from '@/types/payment'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rateLimit'

/**
 * POST /api/payments/create-intent
 *
 * Canonical payment-intent creation endpoint.
 * Handles job payments (with optional bundle pricing), posting fees, and
 * Stripe Connect transfers (when workerStripeAccountId is supplied).
 *
 * Deprecated aliases:
 *  - /api/payments/create-payment-intent → forwards here
 *  - /api/stripe/create-payment-intent   → forwards here
 */

/** Platform fee charged on every Connect payment (5 %). */
const PLATFORM_FEE_RATE = 0.05

export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

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
      workerStripeAccountId?: string
      estimatedBudget?: number
    }

    const {
      currency,
      jobId,
      employerId,
      workerId,
      description,
      paymentMethod,
      bundleType,
      workerStripeAccountId,
      estimatedBudget,
    } = body

    void paymentMethod

    if (estimatedBudget !== undefined) {
      if (!jobId || !employerId) {
        return NextResponse.json({ error: 'Missing required fields: jobId, employerId, estimatedBudget' }, { status: 400 })
      }
      const feeInfo = getPostingFee(estimatedBudget)
      const result = await createPaymentIntent({
        amount: feeInfo.fee,
        currency: 'nzd',
        description: `QuickTrade job posting fee — ${feeInfo.label}`,
        metadata: {
          type: 'posting_fee',
          jobId,
          employerId,
          feeSize: feeInfo.size,
          estimatedBudget: String(estimatedBudget),
        },
      })
      return NextResponse.json({ ...result, feeInfo, currency: 'nzd' })
    }

    if (!jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let amount: number
    let bundleJobCount = 1
    let savingsPercent = 0

    if (bundleType) {
      const bundle = BUNDLE_PRICING.find((b) => b.type === bundleType)
      if (!bundle) {
        return NextResponse.json({ error: 'Invalid bundleType' }, { status: 400 })
      }
      amount = bundle.totalPrice
      bundleJobCount = bundle.jobCount
      savingsPercent = bundle.savingsPercent
    } else {
      if (!body.amount) {
        return NextResponse.json(
          { error: "Missing required fields: provide 'bundleType', 'amount', or 'estimatedBudget'" },
          { status: 400 }
        )
      }
      amount = body.amount
    }

    if (workerStripeAccountId) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY
      if (!stripeSecretKey) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
      }
      const stripe = new Stripe(stripeSecretKey)
      const resolvedCurrency = currency ?? 'nzd'
      const amountCents = Math.round(amount * 100)
      const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_RATE)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: resolvedCurrency,
        automatic_payment_methods: { enabled: true },
        metadata: { jobId, employerId, workerId, bundleType: bundleType ?? 'single' },
        transfer_data: { destination: workerStripeAccountId },
        application_fee_amount: platformFeeCents,
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        bundleType: bundleType ?? 'single',
        bundleJobCount,
        savingsPercent,
      })
    }

    const result = await createPaymentIntent({
      amount,
      currency: currency ?? 'nzd',
      description,
      metadata: {
        jobId,
        employerId,
        workerId,
        bundleType: bundleType ?? 'single',
        bundleJobCount: String(bundleJobCount),
        savingsPercent: String(savingsPercent),
      },
    })

    return NextResponse.json({
      ...result,
      bundleType: bundleType ?? 'single',
      bundleJobCount,
      savingsPercent,
    })
  } catch (error) {
    console.error('POST /api/payments/create-intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
