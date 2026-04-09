import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const { searchParams } = request.nextUrl  // ← CHANGED THIS LINE
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecretKey)
    const account = await stripe.accounts.retrieve(accountId)

    return NextResponse.json({
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requiresAction: !account.details_submitted || !account.payouts_enabled,
    })
  } catch (error) {
    console.error('Stripe account status error:', error)
    return NextResponse.json({ error: 'Failed to fetch account status' }, { status: 500 })
  }
}
