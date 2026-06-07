import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SubscriptionPlan } from '@/types/payment'
import { rateLimit } from '@/lib/rateLimit'
import { adminDb } from '@/lib/firebase-admin'
import { serializeSubscription, toIsoTimestamp } from '@/lib/server/firestoreSerializers'

function planAmount(plan: SubscriptionPlan, billingInterval: 'month' | 'year'): number {
  const amounts: Record<SubscriptionPlan, Record<'month' | 'year', number>> = {
    free: { month: 0, year: 0 },
    pro: { month: 49, year: 39 },
    enterprise: { month: 89, year: 71 },
  }

  return amounts[plan][billingInterval]
}

/**
 * GET  /api/subscriptions?userId=xxx  — get user's current subscription
 * POST /api/subscriptions             — create or upgrade subscription
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const snapshot = await adminDb
      .collection('subscriptions')
      .where('userId', '==', userId)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ subscription: null })
    }

    const doc = snapshot.docs
      .sort((a, b) => {
        const aUpdated = toIsoTimestamp((a.data() as Record<string, unknown>).updatedAt) ?? ''
        const bUpdated = toIsoTimestamp((b.data() as Record<string, unknown>).updatedAt) ?? ''
        return bUpdated.localeCompare(aUpdated)
      })[0]
    return NextResponse.json({
      subscription: serializeSubscription(doc.id, doc.data() as Record<string, unknown>),
    })
  } catch (error) {
    console.error('GET /api/subscriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 },
    )
  }

  try {
    const body = await req.json() as {
      userId?: string
      plan?: SubscriptionPlan
      billingInterval?: 'month' | 'year'
      paymentMethodId?: string
    }

    const { userId, plan, billingInterval = 'month' } = body

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validPlans: SubscriptionPlan[] = ['free', 'pro', 'enterprise']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (plan !== 'free') {
      return NextResponse.json(
        { error: 'Paid subscriptions require live billing and cannot be created from placeholder data.' },
        { status: 501 },
      )
    }

    const now = new Date()
    const periodEnd = new Date(
      now.getTime() + (billingInterval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000,
    )
    const payload = {
      userId,
      plan,
      status: 'active',
      billingInterval,
      amount: planAmount(plan, billingInterval),
      currency: 'nzd',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      updatedAt: now.toISOString(),
      createdAt: now.toISOString(),
    }

    const existing = await adminDb
      .collection('subscriptions')
      .where('userId', '==', userId)
      .limit(1)
      .get()

    if (!existing.empty) {
      const doc = existing.docs[0]
      await doc.ref.update(payload)
      return NextResponse.json(
        serializeSubscription(doc.id, {
          ...(doc.data() as Record<string, unknown>),
          ...payload,
        }),
        { status: 200 },
      )
    }

    const ref = await adminDb.collection('subscriptions').add(payload)
    return NextResponse.json(serializeSubscription(ref.id, payload), { status: 201 })
  } catch (error) {
    console.error('POST /api/subscriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
