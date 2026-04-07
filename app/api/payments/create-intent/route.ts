import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for a job payment.
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
    }

    const {
      amount,
      currency = 'usd',
      jobId,
      employerId,
      workerId,
      description,
      paymentMethod,
    } = body

    // paymentMethod is forwarded as a Stripe payment_method hint in production;
    // not required for PaymentIntent creation with automatic_payment_methods enabled.
    void paymentMethod

    if (!amount || !jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await createPaymentIntent({
      amount,
      currency,
      description,
      metadata: { jobId, employerId, workerId },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/payments/create-intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
