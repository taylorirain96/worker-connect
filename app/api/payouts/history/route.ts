import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payouts/history
 * Returns payout list from Stripe for the authenticated worker.
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
      return NextResponse.json({ payouts: [], noAccount: true })
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      // Return empty list when Stripe is not configured
      return NextResponse.json({ payouts: [] })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' })

    const { data: stripePayouts } = await stripe.payouts.list(
      { limit: 50 },
      { stripeAccount: stripeAccountId }
    )

    const payouts = stripePayouts.map((p) => {
      // Extract bank account last4 from destination if available
      const dest = p.destination as { last4?: string; bank_name?: string } | string | null
      const last4 =
        dest && typeof dest === 'object' ? dest.last4 : undefined
      const bankName =
        dest && typeof dest === 'object' ? dest.bank_name : undefined

      return {
        id: p.id,
        amount: p.amount / 100,
        currency: p.currency,
        status: p.status,
        bankAccountLast4: last4,
        bankName,
        createdAt: new Date(p.created * 1000).toISOString(),
        estimatedArrival: p.arrival_date
          ? new Date(p.arrival_date * 1000).toISOString()
          : undefined,
        failureMessage: p.failure_message ?? undefined,
      }
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error('[payouts/history] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
