import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'
import { BUNDLE_PRICING } from '@/types/payment'
import type { BundleType } from '@/types/payment'

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for a job payment.
 * Supports bundle pricing via the optional `bundleType` parameter.
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
    }

    const {
      currency = 'usd',
      jobId,
      employerId,
      workerId,
      description,
      paymentMethod,
      bundleType,
    } = body

    // paymentMethod is forwarded as a Stripe payment_method hint in production;
    // not required for PaymentIntent creation with automatic_payment_methods enabled.
    void paymentMethod

    if (!jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Resolve the charge amount from bundle pricing or the explicit amount field.
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
      if (!bundleType && !body.amount) {
        return NextResponse.json(
          { error: "Missing required fields: provide 'bundleType' or 'amount'" },
          { status: 400 }
        )
      }
      amount = body.amount!
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
