import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { RequestPayoutRequest } from '@/types/payment'
import { STRIPE_CONNECT_CONFIG } from '@/lib/stripe/stripeConnect'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payouts/request
 * Initiates a payout to a worker's connected Stripe account.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<RequestPayoutRequest>
    const { workerId, amount, currency = 'usd', stripeConnectAccountId, description } = body

    if (!workerId || !amount || !stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'Missing required fields: workerId, amount, stripeConnectAccountId' },
        { status: 400 }
      )
    }

    if (amount < STRIPE_CONNECT_CONFIG.minPayoutAmount) {
      return NextResponse.json(
        { error: `Minimum payout amount is $${STRIPE_CONNECT_CONFIG.minPayoutAmount}.00` },
        { status: 400 }
      )
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      // Mock response for development
      return NextResponse.json({
        payout: {
          id: `po_mock_${Date.now()}`,
          workerId,
          amount,
          currency,
          status: 'pending',
          estimatedArrival: new Date(Date.now() + 3 * 86_400_000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      })
    }

    const { getStripe, toCents } = await import('@/lib/stripe')
    const stripe = getStripe()

    const payout = await stripe.payouts.create(
      {
        amount: toCents(amount),
        currency,
        description: description ?? `Payout for worker ${workerId}`,
      },
      { stripeAccount: stripeConnectAccountId }
    )

    // Persist payout record
    try {
      const { createPayout } = await import('@/lib/services/paymentService')
      await createPayout({
        workerId,
        amount,
        currency: currency as 'usd',
        method: 'bank_account',
        status: 'pending',
        stripePayoutId: payout.id,
        estimatedArrival: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString()
          : undefined,
      })
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      payout: {
        id: payout.id,
        workerId,
        amount,
        currency,
        status: payout.status,
        estimatedArrival: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString()
          : undefined,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('POST /api/payouts/request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
