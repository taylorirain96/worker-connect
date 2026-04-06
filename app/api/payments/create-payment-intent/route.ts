import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, currency, jobId, employerId, workerId, workerStripeAccountId } = body as {
      amount: number
      currency?: string
      jobId: string
      employerId: string
      workerId: string
      workerStripeAccountId?: string
    }

    if (!amount || !jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey)

    const amountCents = Math.round(amount * 100)
    const resolvedCurrency = currency || 'usd'

    // Platform fee: 5% of the job amount
    const platformFeeCents = Math.round(amountCents * 0.05)

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency: resolvedCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: { jobId, employerId, workerId },
    }

    // If the worker has a Stripe Connect account, route payment via Connect
    if (workerStripeAccountId) {
      paymentIntentParams.transfer_data = { destination: workerStripeAccountId }
      paymentIntentParams.application_fee_amount = platformFeeCents
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
