import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { accountId, refreshUrl, returnUrl } = body as {
      accountId: string
      refreshUrl: string
      returnUrl: string
    }

    if (!accountId || !refreshUrl || !returnUrl) {
      return NextResponse.json(
        { error: 'accountId, refreshUrl and returnUrl are required' },
        { status: 400 }
      )
    }

    const stripe = new Stripe(stripeSecretKey)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe account link error:', error)
    return NextResponse.json({ error: 'Failed to create account link' }, { status: 500 })
  }
}
