import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * POST /api/stripe/connect/account-link
 * Creates a Stripe Connect onboarding link for a worker.
 * Body: { accountId: string, refreshUrl: string, returnUrl: string }
 */
export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await req.json() as { accountId?: string; refreshUrl?: string; returnUrl?: string }
    const { accountId, refreshUrl, returnUrl } = body

    if (!accountId || !refreshUrl || !returnUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production use the Stripe SDK:
    // const stripe = new Stripe(stripeSecretKey)
    // const accountLink = await stripe.accountLinks.create({
    //   account: accountId,
    //   refresh_url: refreshUrl,
    //   return_url: returnUrl,
    //   type: 'account_onboarding',
    // })
    // return NextResponse.json({ url: accountLink.url })

    // Mock response for development
    return NextResponse.json({
      url: `${returnUrl}?mock_onboarding=1&account=${accountId}`,
    })
  } catch (error) {
    console.error('Stripe account-link error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
