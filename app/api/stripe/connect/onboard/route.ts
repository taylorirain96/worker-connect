import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * POST /api/stripe/connect/onboard
 * Creates a new Stripe Express account for a worker and returns the onboarding URL.
 * Body: { workerId: string, email: string, refreshUrl: string, returnUrl: string }
 */
export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await req.json() as {
      workerId?: string
      email?: string
      refreshUrl?: string
      returnUrl?: string
    }
    const { workerId, email, refreshUrl, returnUrl } = body

    if (!workerId || !email || !refreshUrl || !returnUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production use the Stripe SDK:
    // const stripe = new Stripe(stripeSecretKey)
    // const account = await stripe.accounts.create({
    //   type: 'express',
    //   email,
    //   metadata: { workerId },
    //   capabilities: { transfers: { requested: true } },
    // })
    // const accountLink = await stripe.accountLinks.create({
    //   account: account.id,
    //   refresh_url: refreshUrl,
    //   return_url: returnUrl,
    //   type: 'account_onboarding',
    // })
    // // Persist account.id to worker profile in Firestore
    // return NextResponse.json({ accountId: account.id, url: accountLink.url })

    // Mock response for development
    const mockAccountId = `acct_mock_${workerId}_${Date.now()}`
    return NextResponse.json({
      accountId: mockAccountId,
      url: `${returnUrl}?mock_onboarding=1&account=${mockAccountId}`,
    })
  } catch (error) {
    console.error('Stripe onboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
