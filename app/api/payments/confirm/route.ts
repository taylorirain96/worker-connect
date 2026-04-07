import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { confirmPaymentIntent, isStripeConfigured } from '@/lib/stripe'

/**
 * POST /api/payments/confirm
 * Confirms a PaymentIntent server-side (for server-to-server flows).
 * In most client integrations, confirmation is handled by Stripe.js directly.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      paymentIntentId?: string
      paymentMethodId?: string
    }

    const { paymentIntentId, paymentMethodId } = body

    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, paymentMethodId' },
        { status: 400 }
      )
    }

    if (!isStripeConfigured()) {
      // Mock confirmation for development
      return NextResponse.json({
        status: 'succeeded',
        paymentIntentId,
      })
    }

    const result = await confirmPaymentIntent(paymentIntentId, paymentMethodId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/payments/confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
