import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, currency, jobId, employerId, workerId } = body

    if (!amount || !jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // In production, use Stripe SDK:
    // const stripe = new Stripe(stripeSecretKey)
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency: currency || 'usd',
    //   metadata: { jobId, employerId, workerId },
    // })

    // Mock response for development
    return NextResponse.json({
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
      paymentIntentId: `pi_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
