import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import type { Subscription, SubscriptionPlan } from '@/types/payment'
import { rateLimit } from '@/lib/rateLimit'
import { adminDb } from '@/lib/firebase-admin'

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function serializeSubscription(
  id: string,
  data: Record<string, unknown>,
): Subscription {
  return {
    id,
    userId: typeof data.userId === 'string' ? data.userId : '',
    plan: (data.plan as SubscriptionPlan) ?? 'free',
    status: (data.status as Subscription['status']) ?? 'active',
    stripeSubscriptionId:
      typeof data.stripeSubscriptionId === 'string' ? data.stripeSubscriptionId : undefined,
    stripeCustomerId:
      typeof data.stripeCustomerId === 'string' ? data.stripeCustomerId : undefined,
    currentPeriodStart: toIso(data.currentPeriodStart),
    currentPeriodEnd: toIso(data.currentPeriodEnd),
    cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
    billingInterval: data.billingInterval === 'year' ? 'year' : 'month',
    amount: typeof data.amount === 'number' ? data.amount : 0,
    currency: typeof data.currency === 'string' ? data.currency : 'nzd',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    canceledAt: data.canceledAt ? toIso(data.canceledAt) : undefined,
    trialEnd: data.trialEnd ? toIso(data.trialEnd) : undefined,
  }
}

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
        const aUpdated = toIso((a.data() as Record<string, unknown>).updatedAt)
        const bUpdated = toIso((b.data() as Record<string, unknown>).updatedAt)
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
    const payload = {
      userId,
      plan,
      status: 'active',
      billingInterval,
      amount: planAmount(plan, billingInterval),
      currency: 'nzd',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: now.toISOString(),
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
