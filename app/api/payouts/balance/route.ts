import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payouts/balance
 * Returns available + pending balance from Stripe Connect for the authenticated worker.
 * Reads x-user-id header for authentication.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the worker's Stripe Connect account ID from Firestore
    const userSnap = await adminDb.collection('users').doc(userId).get()
    const stripeAccountId = userSnap.data()?.stripeAccountId as string | undefined

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe Connect account found', noAccount: true },
        { status: 404 }
      )
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Payment provider not configured', noStripe: true },
        { status: 503 }
      )
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' })

    const balance = await stripe.balance.retrieve(
      undefined,
      { stripeAccount: stripeAccountId }
    )

    const available = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100
    const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100
    const currency = balance.available[0]?.currency ?? 'usd'

    return NextResponse.json({ available, pending, currency, stripeAccountId })
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setContext('payouts_balance', {
        route: '/api/payouts/balance',
      })
      Sentry.captureException(error)
    })
    console.error('[payouts/balance] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
