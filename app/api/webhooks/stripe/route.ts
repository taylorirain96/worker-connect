import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  console.log(`Stripe payout webhook received: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        // Find withdrawal record by Stripe payout ID and update status
        const snapshot = await adminDb
          .collection('withdrawals')
          .where('stripePayoutId', '==', payout.id)
          .limit(1)
          .get()
        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          const workerId = doc.data().workerId as string | undefined
          await doc.ref.update({ status: 'completed', completedAt: new Date().toISOString() })
          if (workerId) {
            await sendNotification({
              userId: workerId,
              type: 'payout_processed',
              title: 'Payout Deposited',
              message: `Your payout of $${(payout.amount / 100).toFixed(2)} has been deposited.`,
              metadata: { stripePayoutId: payout.id, amount: payout.amount },
            })
          }
        }
        break
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout
        const snapshot = await adminDb
          .collection('withdrawals')
          .where('stripePayoutId', '==', payout.id)
          .limit(1)
          .get()
        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          const workerId = doc.data().workerId as string | undefined
          await doc.ref.update({
            status: 'failed',
            failureCode: payout.failure_code ?? null,
            failureMessage: payout.failure_message ?? null,
            failedAt: new Date().toISOString(),
          })
          if (workerId) {
            await sendNotification({
              userId: workerId,
              type: 'payment_failed',
              title: 'Payout Failed',
              message: `Your payout of $${(payout.amount / 100).toFixed(2)} could not be processed. ${payout.failure_message ?? ''}`.trim(),
              metadata: {
                stripePayoutId: payout.id,
                ...(payout.failure_code ? { failureCode: payout.failure_code } : {}),
              },
            })
          }
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        // Find worker profile by Stripe Connect account ID and sync status
        const snapshot = await adminDb
          .collection('workers')
          .where('stripeConnectAccountId', '==', account.id)
          .limit(1)
          .get()
        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          await doc.ref.update({
            stripeConnectStatus: {
              chargesEnabled: account.charges_enabled,
              payoutsEnabled: account.payouts_enabled,
              detailsSubmitted: account.details_submitted,
              updatedAt: new Date().toISOString(),
            },
          })
        }
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error(`Error processing Stripe payout webhook event ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
