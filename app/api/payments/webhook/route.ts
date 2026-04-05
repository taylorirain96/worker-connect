import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // In production, verify and handle webhook events:
    // const stripe = new Stripe(stripeSecretKey)
    // const event = stripe.webhooks.constructEvent(_body, signature, webhookSecret)
    //
    // switch (event.type) {
    //   case 'payment_intent.succeeded':
    //     // Update payment status in Firestore
    //     break
    //   case 'payment_intent.payment_failed':
    //     // Handle failed payment
    //     break
    // }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
