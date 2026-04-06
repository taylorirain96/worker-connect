import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { STRIPE_CONNECT_CONFIG } from '@/lib/stripe/stripeConnect'

/**
 * GET  /api/payouts?workerId=xxx  — list payouts for a worker
 * POST /api/payouts               — request a new payout
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workerId = searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 })
    }

    // In production, fetch from Firestore via paymentService.getWorkerPayouts(workerId)
    // Mock response for development
    const mockPayouts = [
      {
        id: 'po_mock_1',
        workerId,
        amount: 250,
        currency: 'usd',
        method: 'bank_account',
        status: 'paid',
        bankAccountLast4: '4242',
        bankName: 'Chase',
        estimatedArrival: new Date(Date.now() - 3 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'po_mock_2',
        workerId,
        amount: 180,
        currency: 'usd',
        method: 'bank_account',
        status: 'in_transit',
        bankAccountLast4: '4242',
        bankName: 'Chase',
        estimatedArrival: new Date(Date.now() + 2 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    return NextResponse.json({ payouts: mockPayouts })
  } catch (error) {
    console.error('List payouts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await req.json() as {
      workerId?: string
      amount?: number
      currency?: string
      stripeConnectAccountId?: string
    }
    const { workerId, amount, currency = 'usd', stripeConnectAccountId } = body

    if (!workerId || !amount || !stripeConnectAccountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < STRIPE_CONNECT_CONFIG.minPayoutAmount) {
      return NextResponse.json({ error: `Minimum payout amount is $${STRIPE_CONNECT_CONFIG.minPayoutAmount}.00` }, { status: 400 })
    }

    // In production:
    // const stripe = new Stripe(stripeSecretKey)
    // const payout = await stripe.payouts.create(
    //   { amount: Math.round(amount * 100), currency },
    //   { stripeAccount: stripeConnectAccountId }
    // )
    // Also create record in Firestore via paymentService.createPayout(...)
    // return NextResponse.json({ payoutId: payout.id, status: payout.status })

    // Mock response
    return NextResponse.json({
      payoutId: `po_mock_${Date.now()}`,
      status: 'pending',
      amount,
      currency,
      estimatedArrival: new Date(Date.now() + 3 * 86400000).toISOString(),
    })
  } catch (error) {
    console.error('Create payout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
