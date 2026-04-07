import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey)

  let event: Stripe.Event
  if (WEBHOOK_SECRET && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // In production, always require a verified signature. Allow unsigned payloads
    // only in local development (NODE_ENV !== 'production') to ease testing.
    if (process.env.NODE_ENV === 'production') {
      console.error('Stripe webhook received without signature in production — rejecting')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
    console.warn('STRIPE_WEBHOOK_SECRET not configured — skipping signature verification (dev only)')
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }

  switch (event.type) {
    case 'payout.paid': {
      const payout = event.data.object as Stripe.Payout
      // Find and update the matching withdrawal record by stripeTransferId
      const snapshot = await adminDb
        .collection('withdrawals')
        .where('stripeTransferId', '==', payout.id)
        .limit(1)
        .get()
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          status: 'completed',
          completedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
      break
    }
    case 'payout.failed': {
      const payout = event.data.object as Stripe.Payout
      const snapshot = await adminDb
        .collection('withdrawals')
        .where('stripeTransferId', '==', payout.id)
        .limit(1)
        .get()
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          status: 'failed',
          failureReason: (payout as Stripe.Payout & { failure_message?: string }).failure_message ?? 'Unknown',
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
      break
    }
    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      // Sync Connect account status back to the worker profile
      const usersSnapshot = await adminDb
        .collection('users')
        .where('stripeAccountId', '==', account.id)
        .limit(1)
        .get()
      if (!usersSnapshot.empty) {
        await usersSnapshot.docs[0].ref.update({
          stripeAccountVerified: account.details_submitted && account.payouts_enabled,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
