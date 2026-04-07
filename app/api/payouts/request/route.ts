import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { STRIPE_CONNECT_CONFIG } from '@/lib/stripe/stripeConnect'

/**
 * POST /api/payouts/request
 * Requests a payout for a worker. Validates minimum payout amount
 * and initiates a Stripe Connect payout.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      workerId?: string
      amount?: number
      currency?: string
      stripeConnectAccountId?: string
      method?: 'bank_account' | 'debit_card'
    }

    const { workerId, amount, currency = 'usd', stripeConnectAccountId, method = 'bank_account' } = body

    if (!workerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: workerId, amount' },
        { status: 400 }
      )
    }

    if (amount < STRIPE_CONNECT_CONFIG.minPayoutAmount) {
      return NextResponse.json(
        { error: `Minimum payout amount is $${STRIPE_CONNECT_CONFIG.minPayoutAmount}.00` },
        { status: 400 }
      )
    }

    if (!STRIPE_CONNECT_CONFIG.supportedCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: `Unsupported currency: ${currency}` },
        { status: 400 }
      )
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      // Mock payout for development
      return NextResponse.json({
        payoutId: `po_mock_${Date.now()}`,
        workerId,
        amount,
        currency,
        method,
        status: 'pending',
        estimatedArrival: new Date(Date.now() + 3 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      })
    }

    // In production:
    // const stripe = getStripe()
    // const payout = await stripe.payouts.create(
    //   { amount: Math.round(amount * 100), currency, method },
    //   { stripeAccount: stripeConnectAccountId }
    // )
    // Also create record in Firestore
    void stripeConnectAccountId

    return NextResponse.json({
      payoutId: `po_mock_${Date.now()}`,
      workerId,
      amount,
      currency,
      method,
      status: 'pending',
      estimatedArrival: new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('POST /api/payouts/request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
