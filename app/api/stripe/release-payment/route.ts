/**
 * POST /api/stripe/release-payment
 *
 * Releases an escrow PaymentIntent to the worker, minus the platform commission.
 * Called when the employer marks the job as complete, or automatically after 7 days.
 *
 * Commission tiers (deducted from escrow before paying worker):
 *   New Worker (0–5 jobs):     18%
 *   Established (6–20 jobs):   15%
 *   Pro Worker (21–50 jobs):   12%
 *   Elite Worker (51+ jobs):   10%
 */
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getWorkerTier } from '@/types'
import { isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rateLimit'
import { sendPaymentReleasedEmail } from '@/lib/email/transactional'
import { adminDb } from '@/lib/firebase-admin'
import { sendAdminNotification } from '@/lib/notifications/admin'

export async function POST(request: Request) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json() as {
      paymentIntentId?: string
      jobId?: string
      jobTitle?: string
      workerId?: string
      workerCompletedJobs?: number
      amount?: number
      workerStripeAccountId?: string
    }

    const {
      paymentIntentId,
      jobId,
      jobTitle,
      workerId,
      workerCompletedJobs = 0,
      amount,
      workerStripeAccountId,
    } = body

    if (!paymentIntentId || !jobId || !workerId || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, jobId, workerId, amount' },
        { status: 400 }
      )
    }

    const tierInfo = getWorkerTier(workerCompletedJobs)
    const commissionCents = Math.round(amount * 100 * tierInfo.commissionRate)
    const workerReceivesCents = Math.round(amount * 100) - commissionCents
    const commission = commissionCents / 100
    const workerReceives = workerReceivesCents / 100

    // Send "Payment Released" email to worker (non-blocking)
    const sendPaymentEmail = async () => {
      try {
        let workerEmail: string | undefined
        let workerName: string | undefined
        if (adminDb) {
          const workerSnap = await adminDb.collection('users').doc(workerId).get()
          if (workerSnap.exists) {
            const data = workerSnap.data()
            workerEmail = data?.email as string | undefined
            workerName = (data?.displayName ?? data?.name ?? 'there') as string
          }
        }
        if (workerEmail) {
          await sendPaymentReleasedEmail({
            workerEmail,
            workerName: workerName ?? 'there',
            jobTitle: jobTitle ?? jobId,
            grossAmount: amount,
            commissionAmount: commission,
            workerAmount: workerReceives,
            jobId,
          })
        }
      } catch (emailErr) {
        Sentry.withScope((scope) => {
          scope.setContext('stripe_release_payment_email', {
            route: '/api/stripe/release-payment',
            paymentIntentId,
            jobId,
            workerId,
            amount,
          })
          Sentry.captureException(emailErr)
        })
        console.error('Failed to send payment-released email:', emailErr)
      }
    }

    let stripeOk = false

    if (isStripeConfigured()) {
      const key = process.env.STRIPE_SECRET_KEY!
      const stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia' })

      // Capture the held funds
      await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: Math.round(amount * 100),
      })

      // Transfer worker's share to their Connect account if available
      if (workerStripeAccountId) {
        await stripe.transfers.create({
          amount: workerReceivesCents,
          currency: 'nzd',
          destination: workerStripeAccountId,
          metadata: {
            jobId,
            workerId,
            paymentIntentId,
            commission: String(commission),
            commissionRate: String(tierInfo.commissionRate),
            workerTier: tierInfo.tier,
          },
        })
      }

      stripeOk = true
    }

    // Fire-and-forget payment email regardless of Stripe mode (non-blocking)
    sendPaymentEmail().catch((emailErr) => {
      Sentry.withScope((scope) => {
        scope.setContext('stripe_release_payment_email_background', {
          route: '/api/stripe/release-payment',
          paymentIntentId,
          jobId,
          workerId,
          amount,
        })
        Sentry.captureException(emailErr)
      })
    })

    // Push notification to worker: payment released (non-blocking)
    if (workerId) {
      sendAdminNotification({
        userId: workerId,
        title: 'Payment released 💰',
        body: `NZ$${workerReceives.toFixed(2)} has been released for "${jobTitle ?? jobId}".`,
        type: 'payment_received',
        link: `/jobs/${jobId}`,
      }).catch((notificationErr) => {
        Sentry.withScope((scope) => {
          scope.setContext('stripe_release_payment_notification_background', {
            route: '/api/stripe/release-payment',
            paymentIntentId,
            jobId,
            workerId,
            amount,
          })
          Sentry.captureException(notificationErr)
        })
      })
    }

    const responsePayload = {
      success: true,
      paymentIntentId,
      amount,
      commission,
      commissionRate: tierInfo.commissionRate,
      workerReceives,
      workerTier: tierInfo.tier,
      workerTierLabel: tierInfo.label,
      currency: 'nzd',
      releasedAt: new Date().toISOString(),
      ...(stripeOk ? {} : { mock: true }),
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setContext('stripe_release_payment', {
        route: '/api/stripe/release-payment',
      })
      Sentry.captureException(error)
    })
    console.error('POST /api/stripe/release-payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
