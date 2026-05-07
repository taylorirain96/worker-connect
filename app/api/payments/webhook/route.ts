/**
 * @deprecated Use /api/stripe/webhook instead (canonical webhook handler).
 * All payment, payout, and dispute events are now handled there.
 * Configure your Stripe dashboard to point to /api/stripe/webhook.
 */
import { NextResponse } from 'next/server'

export async function POST() {
  console.warn('[deprecated] /api/payments/webhook — configure Stripe to use /api/stripe/webhook')
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/stripe/webhook instead.' },
    { status: 410 }
  )
}
