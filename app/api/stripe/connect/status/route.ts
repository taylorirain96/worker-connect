import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/stripe/connect/status?accountId=acct_xxx
 * Returns the Stripe Connect account status for a worker.
 */
export async function GET(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 })
    }

    // In production use the Stripe SDK:
    // const stripe = new Stripe(stripeSecretKey)
    // const account = await stripe.accounts.retrieve(accountId)
    // return NextResponse.json({
    //   accountId: account.id,
    //   chargesEnabled: account.charges_enabled,
    //   payoutsEnabled: account.payouts_enabled,
    //   detailsSubmitted: account.details_submitted,
    //   requiresAction: !account.details_submitted || !account.charges_enabled,
    // })

    // Mock response for development
    return NextResponse.json({
      accountId,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      requiresAction: false,
    })
  } catch (error) {
    console.error('Stripe account status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
