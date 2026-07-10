import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { STRIPE_CONNECT_CONFIG } from '@/lib/stripe/stripeConnect'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getStripe } from '@/lib/stripe'

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

/**
 * GET  /api/payouts?workerId=xxx  — list payouts for a worker
 * POST /api/payouts               — request a new payout
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workerId = searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 })
    }

    const snap = await adminDb
      .collection('payouts')
      .where('workerId', '==', workerId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const payouts = snap.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return {
        id: doc.id,
        ...data,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
        paidAt: data.paidAt ? toIso(data.paidAt) : undefined,
        estimatedArrival: data.estimatedArrival ? toIso(data.estimatedArrival) : undefined,
      }
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setContext('payouts_list', {
        route: '/api/payouts',
        method: 'GET',
      })
      Sentry.captureException(error)
    })
    console.error('List payouts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const body = await req.json() as {
      workerId?: string
      amount?: number
      currency?: string
      stripeConnectAccountId?: string
    }
    const { workerId, amount, currency = 'usd', stripeConnectAccountId } = body

    if (!workerId || !amount || !stripeConnectAccountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < STRIPE_CONNECT_CONFIG.minPayoutAmount) {
      return NextResponse.json({ error: `Minimum payout amount is $${STRIPE_CONNECT_CONFIG.minPayoutAmount}.00` }, { status: 400 })
    }

    const stripe = getStripe()
    const payout = await stripe.payouts.create(
      { amount: Math.round(amount * 100), currency },
      { stripeAccount: stripeConnectAccountId }
    )

    const now = FieldValue.serverTimestamp()
    await adminDb.collection('payouts').add({
      workerId,
      amount,
      currency,
      method: 'bank_account',
      status: payout.status,
      stripePayoutId: payout.id,
      stripeConnectAccountId,
      estimatedArrival: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toISOString()
        : null,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      payoutId: payout.id,
      status: payout.status,
      amount,
      currency,
      estimatedArrival: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toISOString()
        : null,
    })
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setContext('payouts_create', {
        route: '/api/payouts',
        method: 'POST',
      })
      Sentry.captureException(error)
    })
    console.error('Create payout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
