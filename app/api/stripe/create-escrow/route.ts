/**
 * POST /api/stripe/create-escrow
 *
 * Creates an escrow PaymentIntent when an employer accepts a worker's quote.
 * Funds are held until the job is complete and payment is released.
 * Currency: NZD
 *
 * TODO: Replace STRIPE_SECRET_KEY with your live key when going live.
 * In production, use Stripe PaymentIntents with capture_method: 'manual'
 * to hold funds without immediately charging the employer.
 */
import { NextResponse } from 'next/server'
import { getWorkerTier } from '@/types'
import { isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      jobId?: string
      jobTitle?: string
      employerId?: string
      workerId?: string
      quoteAmount?: number
      workerCompletedJobs?: number
    }

    const { jobId, jobTitle, employerId, workerId, quoteAmount, workerCompletedJobs = 0 } = body

    if (!jobId || !jobTitle || !employerId || !workerId || !quoteAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, jobTitle, employerId, workerId, quoteAmount' },
        { status: 400 }
      )
    }

    const tierInfo = getWorkerTier(workerCompletedJobs)
    const commission = Math.round(quoteAmount * tierInfo.commissionRate * 100) / 100
    const workerReceives = Math.round((quoteAmount - commission) * 100) / 100

    // Set auto-release date 7 days from now
    const autoReleaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const metadata: Record<string, string> = {
      type: 'escrow',
      jobId,
      jobTitle,
      employerId,
      workerId,
      quoteAmount: String(quoteAmount),
      commission: String(commission),
      commissionRate: String(tierInfo.commissionRate),
      workerReceives: String(workerReceives),
      workerTier: tierInfo.tier,
      autoReleaseAt,
    }

    // Use capture_method: 'manual' to hold funds without immediate capture
    if (isStripeConfigured()) {
      const key = process.env.STRIPE_SECRET_KEY!
      const stripe = new Stripe(key, { apiVersion: '2024-06-20' })
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(quoteAmount * 100),
        currency: 'nzd',
        capture_method: 'manual',
        description: `QuickTrade escrow — ${jobTitle}`,
        metadata,
        automatic_payment_methods: { enabled: true },
      })

      return NextResponse.json({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: intent.amount,
        currency: 'nzd',
        commission,
        commissionRate: tierInfo.commissionRate,
        workerReceives,
        workerTier: tierInfo.tier,
        workerTierLabel: tierInfo.label,
        autoReleaseAt,
      })
    }

    // Mock response when Stripe is not configured (test/dev mode)
    const mockIntentId = `pi_escrow_mock_${Date.now()}`
    return NextResponse.json({
      clientSecret: `${mockIntentId}_secret_mock`,
      paymentIntentId: mockIntentId,
      amount: Math.round(quoteAmount * 100),
      currency: 'nzd',
      commission,
      commissionRate: tierInfo.commissionRate,
      workerReceives,
      workerTier: tierInfo.tier,
      workerTierLabel: tierInfo.label,
      autoReleaseAt,
    })
  } catch (error) {
    console.error('POST /api/stripe/create-escrow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
