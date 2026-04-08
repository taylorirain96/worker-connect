import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe payment webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  console.log(`Stripe payment webhook received: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { paymentId, invoiceId } = pi.metadata ?? {}
        if (paymentId) {
          await adminDb.collection('payments').doc(paymentId).update({
            status: 'completed',
            stripePaymentIntentId: pi.id,
            completedAt: new Date().toISOString(),
          })
        }
        if (invoiceId) {
          await adminDb.collection('invoices').doc(invoiceId).update({
            status: 'paid',
            paidAt: new Date().toISOString(),
          })
        }
        const userId = pi.metadata?.userId
        if (userId) {
          await sendNotification({
            userId,
            type: 'payment_received',
            title: 'Payment Successful',
            message: `Your payment of $${(pi.amount / 100).toFixed(2)} was completed successfully.`,
            metadata: { stripePaymentIntentId: pi.id, amount: pi.amount },
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { paymentId } = pi.metadata ?? {}
        if (paymentId) {
          await adminDb.collection('payments').doc(paymentId).update({
            status: 'failed',
            failureMessage: pi.last_payment_error?.message ?? null,
            failedAt: new Date().toISOString(),
          })
        }
        const userId = pi.metadata?.userId
        if (userId) {
          await sendNotification({
            userId,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Your payment of $${(pi.amount / 100).toFixed(2)} could not be processed. ${pi.last_payment_error?.message ?? ''}`.trim(),
            metadata: { stripePaymentIntentId: pi.id },
          })
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const paymentIdFromDispute = typeof dispute.charge === 'string'
          ? (await adminDb.collection('payments').where('stripeChargeId', '==', dispute.charge).limit(1).get()).docs[0]?.id
          : undefined
        await adminDb.collection('disputes').add({
          stripeDisputeId: dispute.id,
          stripeChargeId: dispute.charge,
          ...(paymentIdFromDispute ? { paymentId: paymentIdFromDispute } : {}),
          amount: dispute.amount,
          currency: dispute.currency,
          reason: dispute.reason,
          description: `Stripe dispute: ${dispute.reason}`,
          evidence: [],
          status: 'open',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: dispute.evidence_details?.due_by
            ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
            : new Date(Date.now() + 7 * 86400000).toISOString(),
        })
        console.log(`Dispute created from Stripe event: ${dispute.id}`)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const { paymentId } = charge.metadata ?? {}
        if (paymentId) {
          await adminDb.collection('payments').doc(paymentId).update({
            status: 'refunded',
            refundedAt: new Date().toISOString(),
          })
        }
        // Create a refund record for the most recent refund on this charge
        const lastRefund = charge.refunds?.data?.[0]
        if (lastRefund) {
          await adminDb.collection('refunds').add({
            ...(paymentId ? { paymentId } : {}),
            stripeRefundId: lastRefund.id,
            stripeChargeId: charge.id,
            amount: lastRefund.amount / 100,
            reason: lastRefund.reason ?? 'customer_request',
            status: lastRefund.status === 'succeeded' ? 'completed' : 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(lastRefund.status === 'succeeded' ? { completedAt: new Date().toISOString() } : {}),
          })
          console.log(`Refund record created from Stripe charge.refunded: ${lastRefund.id}`)
        }
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error(`Error processing Stripe payment webhook event ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
