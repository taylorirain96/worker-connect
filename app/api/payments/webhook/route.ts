import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecretKey)
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { jobId, workerId } = pi.metadata
        if (jobId) {
          await adminDb.collection('payments').doc(pi.id).set(
            {
              status: 'completed',
              amount: pi.amount / 100,
              currency: pi.currency,
              jobId,
              workerId: workerId ?? null,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          )
        }
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { jobId } = pi.metadata
        if (jobId) {
          await adminDb.collection('payments').doc(pi.id).set(
            { status: 'failed', updatedAt: FieldValue.serverTimestamp() },
            { merge: true }
          )
        }
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Payment webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
