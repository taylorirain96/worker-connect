/**
 * POST /api/stripe/release-payment
 *
 * Releases an escrow PaymentIntent to the worker, minus the platform commission.
 * Called when the employer marks the job as complete, or automatically after 7 days.
 *
 * Commission tiers (deducted from escrow before paying worker):
 *   New Worker (0–5 jobs):     10%
 *   Established (6–20 jobs):    8%
 *   Pro Worker (21–50 jobs):    6%
 *   Elite Worker (50+ jobs):    5%
 *
 * TODO: Replace STRIPE_SECRET_KEY with your live key when going live.
 * TODO: In production, use Stripe Connect Transfer to pay the worker directly.
 */
import { NextResponse } from 'next/server'
import { getWorkerTier } from '@/types'
import { isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      paymentIntentId?: string
      jobId?: string
      workerId?: string
      workerCompletedJobs?: number
      amount?: number
      workerStripeAccountId?: string
    }

    const {
      paymentIntentId,
      jobId,
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

    if (isStripeConfigured()) {
      const key = process.env.STRIPE_SECRET_KEY!
      const stripe = new Stripe(key, { apiVersion: '2024-06-20' })

      // Capture the held funds
      await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: Math.round(amount * 100),
      })

      // Transfer worker's share to their Connect account if available
      // TODO: Set up Stripe Connect for workers to receive payouts
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

      return NextResponse.json({
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
      })
    }

    // Mock response when Stripe is not configured (test/dev mode)
    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('POST /api/stripe/release-payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
