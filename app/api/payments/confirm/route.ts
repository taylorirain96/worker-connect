import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { confirmPaymentIntent, isStripeConfigured } from '@/lib/stripe'
import { rateLimit } from '@/lib/rateLimit'

/**
 * POST /api/payments/confirm
 * Confirms a PaymentIntent server-side (for server-to-server flows).
 * In most client integrations, confirmation is handled by Stripe.js directly.
 */
export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

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
    Sentry.withScope((scope) => {
      scope.setContext('payments_confirm', {
        route: '/api/payments/confirm',
      })
      Sentry.captureException(error)
    })
    console.error('POST /api/payments/confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
