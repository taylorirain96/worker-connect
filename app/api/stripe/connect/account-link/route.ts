import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: Request) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

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
