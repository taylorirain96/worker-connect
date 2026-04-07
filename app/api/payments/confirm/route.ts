import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { ConfirmPaymentRequest } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/confirm
 * Confirms a Stripe PaymentIntent with the given payment method.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ConfirmPaymentRequest>
    const { paymentIntentId, paymentMethodId, jobId, employerId, workerId, amount, currency = 'usd' } = body

    if (!paymentIntentId || !paymentMethodId || !jobId || !employerId || !workerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, paymentMethodId, jobId, employerId, workerId, amount' },
        { status: 400 }
      )
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      // Mock response for development
      return NextResponse.json({
        id: `pay_mock_${Date.now()}`,
        status: 'completed',
        amount,
        currency,
      })
    }

    const { getStripe, fromCents } = await import('@/lib/stripe')
    const stripe = getStripe()

    const intent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    })

    const status = intent.status === 'succeeded' ? 'completed'
      : intent.status === 'processing' ? 'processing'
      : intent.status === 'requires_payment_method' ? 'failed'
      : 'pending'

    // Persist the payment record via the payment service if Firestore is available
    try {
      const { createPayment } = await import('@/lib/services/paymentService')
      await createPayment({
        jobId,
        jobTitle: intent.description ?? '',
        employerId,
        workerId,
        amount: fromCents(intent.amount),
        currency: intent.currency as 'usd',
        status,
        stripePaymentIntentId: intent.id,
      })
    } catch {
      // Non-fatal: Firestore may not be available in all environments
    }

    return NextResponse.json({
      id: intent.id,
      status,
      amount: fromCents(intent.amount),
      currency: intent.currency,
    })
  } catch (error) {
    console.error('POST /api/payments/confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
