/**
 * POST /api/stripe/webhook
 *
 * Unified Stripe webhook handler for:
 * - Job posting fee payments (checkout.session.completed)
 * - Escrow payment intents (payment_intent.succeeded, payment_intent.payment_failed)
 */
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'
import {
  getEscrowByPaymentIntent,
  updateEscrowStatus,
  getJobPostingPaymentBySession,
  updateJobPostingPayment,
} from '@/lib/services/escrowService'

export const dynamic = 'force-dynamic'

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
      // ── Job Posting: Checkout Session completed ────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { jobId, employerId, recordId, featuredListing, urgentBadge } = session.metadata ?? {}

        if (session.metadata?.type === 'job_posting' || jobId) {
          // Activate the job
          if (adminDb && jobId) {
            await adminDb.collection('jobs').doc(jobId).update({
              paymentStatus: 'active',
              postingPaymentId: recordId ?? null,
              featuredListing: featuredListing === 'true',
              urgentBadge: urgentBadge === 'true',
              activatedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }

          // Update the payment record
          if (recordId) {
            const paymentRecord = await getJobPostingPaymentBySession(session.id)
            if (paymentRecord) {
              await updateJobPostingPayment(paymentRecord.id, {
                status: 'completed',
                stripePaymentIntentId: typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : undefined,
                completedAt: new Date().toISOString(),
              })
            } else if (adminDb) {
              await adminDb.collection('jobPostingPayments').doc(recordId).update({
                status: 'completed',
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : null,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
          }

          // Notify employer
          if (employerId) {
            await sendNotification({
              userId: employerId,
              type: 'payment_received',
              title: 'Job Posted Successfully! 🎉',
              message: 'Your job has been activated and is now live. Workers can now see and respond to it.',
              metadata: { jobId: jobId ?? '', sessionId: session.id },
            })
          }
        }
        break
      }

      // ── Escrow: PaymentIntent succeeded (funds confirmed/captured) ─────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent

        if (pi.metadata?.type === 'escrow') {
          const escrow = await getEscrowByPaymentIntent(pi.id)
          if (escrow && escrow.status === 'pending') {
            await updateEscrowStatus(escrow.id, 'held')
            if (adminDb) {
              await adminDb.collection('jobs').doc(escrow.jobId).update({
                escrowStatus: 'held',
                updatedAt: new Date().toISOString(),
              })
              await adminDb.collection('quotes').doc(escrow.quoteId).update({
                escrowStatus: 'held',
                updatedAt: new Date().toISOString(),
              })
            }
            await sendNotification({
              userId: escrow.employerId,
              type: 'payment_received',
              title: 'Payment Held in Escrow',
              message: `NZ$${escrow.amount.toFixed(2)} is safely held in escrow for job #${escrow.jobId}. Release payment once the work is complete.`,
              metadata: { escrowId: escrow.id, jobId: escrow.jobId },
            })
            await sendNotification({
              userId: escrow.workerId,
              type: 'payment_received',
              title: 'Escrow Funded — You\'re Protected',
              message: `The employer has placed NZ$${escrow.amount.toFixed(2)} in escrow for job #${escrow.jobId}. Your payment is secured and will be released when the job is complete.`,
              metadata: { escrowId: escrow.id, jobId: escrow.jobId },
            })
          }
        }
        break
      }

      // ── Escrow: PaymentIntent failed ───────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent

        if (pi.metadata?.type === 'escrow') {
          const escrow = await getEscrowByPaymentIntent(pi.id)
          if (escrow) {
            // Keep escrow in pending so employer can retry
            if (adminDb) {
              await adminDb.collection('escrowPayments').doc(escrow.id).update({
                paymentError: pi.last_payment_error?.message ?? 'Payment failed',
                updatedAt: new Date().toISOString(),
              })
            }
            await sendNotification({
              userId: escrow.employerId,
              type: 'payment_failed',
              title: 'Escrow Payment Failed',
              message: `Your escrow payment for job #${escrow.jobId} could not be processed. Please try again.`,
              metadata: { escrowId: escrow.id, jobId: escrow.jobId },
            })
          }
        }
        break
      }

      default:
        // Unhandled event types are silently ignored
        break
    }
  } catch (err) {
    console.error(`Error processing Stripe webhook event ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
