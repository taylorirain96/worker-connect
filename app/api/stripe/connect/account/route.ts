import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({})) as { email?: string; country?: string }

    const stripe = new Stripe(stripeSecretKey)
    const account = await stripe.accounts.create({
      type: 'express',
      country: body.country ?? 'US',
      email: body.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    return NextResponse.json({ accountId: account.id })
  } catch (error) {
    console.error('Stripe create account error:', error)
    return NextResponse.json({ error: 'Failed to create Stripe account' }, { status: 500 })
  }
}
