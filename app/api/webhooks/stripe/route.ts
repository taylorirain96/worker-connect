import { NextRequest, NextResponse } from 'next/server'

// Stripe webhook secret — set via STRIPE_WEBHOOK_SECRET env var
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const body = await req.text()
  // Retrieved for future signature verification:
  // stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET!)
  // TODO: enable once STRIPE_WEBHOOK_SECRET is configured
  void req.headers.get('stripe-signature')

  if (!WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured — webhook verification skipped')
  }

  // TODO: Verify Stripe signature using the stripe library:
  // import Stripe from 'stripe'
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  // const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET!)

  let event: { type: string; data: { object: Record<string, unknown> } }
  try {
    event = JSON.parse(body) as typeof event
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  switch (event.type) {
    case 'payout.paid': {
      // TODO: Update withdrawal status to 'completed' in Firestore
      // TODO: Send payout deposited notification
      console.log('Payout paid:', event.data.object)
      break
    }
    case 'payout.failed': {
      // TODO: Update withdrawal status to 'failed' in Firestore
      // TODO: Notify worker of failed payout
      console.log('Payout failed:', event.data.object)
      break
    }
    case 'account.updated': {
      // TODO: Sync Stripe Connect account status to worker profile
      console.log('Account updated:', event.data.object)
      break
    }
    default:
      // Ignore unhandled event types
      break
  }

  // Acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 })
}
