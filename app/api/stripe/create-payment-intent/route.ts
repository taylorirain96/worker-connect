/**
 * POST /api/stripe/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for a job posting fee (employer pays upfront).
 * Currency: NZD
 *
 * TODO: Replace STRIPE_SECRET_KEY with your live key when going live.
 */
import { NextResponse } from 'next/server'
import { getPostingFee } from '@/types'
import { createPaymentIntent } from '@/lib/stripe'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: Request) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json() as {
      jobId?: string
      employerId?: string
      estimatedBudget?: number
    }

    const { jobId, employerId, estimatedBudget } = body

    if (!jobId || !employerId || estimatedBudget === undefined) {
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

    return NextResponse.json({
      ...result,
      feeInfo,
      currency: 'nzd',
    })
  } catch (error) {
    console.error('POST /api/stripe/create-payment-intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
