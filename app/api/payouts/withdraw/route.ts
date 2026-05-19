import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { STRIPE_CONNECT_CONFIG } from '@/lib/stripe/stripeConnect'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payouts/withdraw
 * Creates a Stripe payout to the worker's connected bank account.
 * Reads x-user-id header for authentication.
 * Body: { amount: number, currency?: string }
 */
export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as { amount?: number; currency?: string }
    const { amount, currency = 'usd' } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (amount < STRIPE_CONNECT_CONFIG.minPayoutAmount) {
      return NextResponse.json(
        { error: `Minimum payout amount is $${STRIPE_CONNECT_CONFIG.minPayoutAmount}.00` },
        { status: 400 }
      )
    }

    // Fetch the worker's Stripe Connect account ID from Firestore
    const userSnap = await adminDb.collection('users').doc(userId).get()
    const stripeAccountId = userSnap.data()?.stripeAccountId as string | undefined

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe Connect account found. Please set up your bank account first.' },
        { status: 404 }
      )
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      // Mock response when Stripe is not configured
      return NextResponse.json({
        payoutId: `po_mock_${Date.now()}`,
        amount,
        currency,
        status: 'pending',
        estimatedArrival: new Date(Date.now() + 3 * 86400000).toISOString(),
      })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

    const amountCents = Math.round(amount * 100)

    const payout = await stripe.payouts.create(
      {
        amount: amountCents,
        currency,
        metadata: { workerId: userId },
      },
      { stripeAccount: stripeAccountId }
    )

    return NextResponse.json({
      payoutId: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      status: payout.status,
      estimatedArrival: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toISOString()
        : new Date(Date.now() + 3 * 86400000).toISOString(),
    })
  } catch (error) {
    console.error('[payouts/withdraw] POST error:', error)
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
