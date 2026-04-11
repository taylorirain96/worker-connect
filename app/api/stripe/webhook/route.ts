/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for the QuickTrade escrow and payment system.
 * Processes: posting fee payments, escrow deposits, and payment releases.
 *
 * TODO: Set STRIPE_WEBHOOK_SECRET in your environment variables.
 * Configure this endpoint URL in your Stripe dashboard under Webhooks.
 */
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

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

  console.log(`Stripe webhook received: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { type, jobId, employerId, workerId } = pi.metadata ?? {}

        if (type === 'posting_fee' && jobId) {
          // Mark job as published after posting fee is paid
          await adminDb.collection('jobs').doc(jobId).update({
            status: 'open',
            postingFeePaid: true,
            postingFeeIntentId: pi.id,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          if (employerId) {
            await sendNotification({
              userId: employerId,
              type: 'payment_received',
              title: 'Job Posted Successfully',
              message: `Your job has been published. Workers can now express interest.`,
              metadata: { jobId, stripePaymentIntentId: pi.id },
            })
          }
        }

        if (type === 'escrow' && jobId && workerId) {
          // Update escrow record to in_escrow when employer deposits
          const snapshot = await adminDb
            .collection('escrows')
            .where('jobId', '==', jobId)
            .where('workerId', '==', workerId)
            .limit(1)
            .get()

          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              status: 'in_escrow',
              stripePaymentIntentId: pi.id,
              updatedAt: new Date().toISOString(),
            })
          }

          if (workerId) {
            await sendNotification({
              userId: workerId,
              type: 'payment_received',
              title: 'Escrow Funded — Start Work',
              message: `The employer has deposited payment into escrow. You can begin the job.`,
              metadata: { jobId, stripePaymentIntentId: pi.id },
            })
          }
        }
        break
      }

      case 'payment_intent.amount_capturable_updated': {
        // Funds are authorised and held — update escrow to awaiting capture
        const pi = event.data.object as Stripe.PaymentIntent
        const { type, jobId, workerId } = pi.metadata ?? {}

        if (type === 'escrow' && jobId) {
          const snapshot = await adminDb
            .collection('escrows')
            .where('jobId', '==', jobId)
            .limit(1)
            .get()

          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              status: 'in_escrow',
              stripePaymentIntentId: pi.id,
              updatedAt: new Date().toISOString(),
            })
          }

          if (workerId) {
            await sendNotification({
              userId: workerId,
              type: 'payment_received',
              title: 'Payment Secured in Escrow',
              message: `Your payment is secured. Complete the job to receive your earnings.`,
              metadata: { jobId, stripePaymentIntentId: pi.id },
            })
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { type, jobId, employerId } = pi.metadata ?? {}

        if (type === 'posting_fee' && jobId) {
          await adminDb.collection('jobs').doc(jobId).update({
            status: 'draft',
            postingFeePaid: false,
            updatedAt: new Date().toISOString(),
          })
        }

        if (employerId) {
          await sendNotification({
            userId: employerId,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Your payment could not be processed. Please try again.`,
            metadata: { ...(jobId ? { jobId } : {}), stripePaymentIntentId: pi.id, paymentType: type ?? 'unknown' },
          })
        }
        break
      }

      case 'transfer.created': {
        // Worker received their payment — update escrow status to released
        const transfer = event.data.object as Stripe.Transfer
        const { jobId, workerId, paymentIntentId } = transfer.metadata ?? {}

        if (jobId) {
          const snapshot = await adminDb
            .collection('escrows')
            .where('jobId', '==', jobId)
            .limit(1)
            .get()

          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              status: 'released',
              releasedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }

          await adminDb.collection('jobs').doc(jobId).update({
            status: 'completed',
            paymentReleasedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }

        if (workerId) {
          await sendNotification({
            userId: workerId,
            type: 'payment_received',
            title: 'Payment Released — Funds on the Way',
            message: `Your earnings have been released. Funds will appear in your account shortly.`,
            metadata: {
              ...(jobId ? { jobId } : {}),
              stripeTransferId: transfer.id,
              ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
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
    console.error(`Error processing Stripe webhook event ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
