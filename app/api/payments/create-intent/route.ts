import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CreatePaymentIntentRequest } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent and returns the clientSecret.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreatePaymentIntentRequest>
    const { amount, currency = 'usd', jobId, employerId, workerId, method = 'card', description, metadata } = body

    if (!amount || !jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields: amount, jobId, employerId, workerId' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      // Return a mock response when Stripe is not configured (development / CI)
      return NextResponse.json({
        clientSecret: `pi_mock_${Date.now()}_secret_mock`,
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
      })
    }

    const { getStripe, toCents } = await import('@/lib/stripe')
    const stripe = getStripe()

    const paymentMethodTypes: string[] = method === 'card'
      ? ['card']
      : method === 'bank_transfer'
      ? ['us_bank_account']
      : ['card', 'link']

    const intent = await stripe.paymentIntents.create({
      amount: toCents(amount),
      currency,
      payment_method_types: paymentMethodTypes,
      description: description ?? `Payment for job ${jobId}`,
      metadata: {
        jobId,
        employerId,
        workerId,
        method,
        ...(metadata ?? {}),
      },
    })

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
    })
  } catch (error) {
    console.error('POST /api/payments/create-intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
