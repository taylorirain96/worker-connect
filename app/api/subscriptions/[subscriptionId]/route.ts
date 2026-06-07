import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import type { Subscription, SubscriptionPlan } from '@/types/payment'

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function serializeSubscription(id: string, data: Record<string, unknown>): Subscription {
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

/**
 * GET    /api/subscriptions/[subscriptionId]  — get subscription details
 * PUT    /api/subscriptions/[subscriptionId]  — update subscription (plan change, billing interval)
 * DELETE /api/subscriptions/[subscriptionId]  — cancel subscription
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ subscriptionId: string }> },
) {
  const params = await context.params
  try {
    const { subscriptionId } = params

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    const { adminDb } = await import('@/lib/firebase-admin')
    const snap = await adminDb.collection('subscriptions').doc(subscriptionId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({
      subscription: serializeSubscription(snap.id, snap.data() as Record<string, unknown>),
    })
  } catch (error) {
    console.error('GET /api/subscriptions/[subscriptionId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ subscriptionId: string }> },
) {
  const params = await context.params
  try {
    const { subscriptionId } = params
    const body = await req.json() as {
      plan?: SubscriptionPlan
      billingInterval?: 'month' | 'year'
      cancelAtPeriodEnd?: boolean
    }

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    const { adminDb } = await import('@/lib/firebase-admin')
    const ref = adminDb.collection('subscriptions').doc(subscriptionId)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (body.plan) {
      updates.plan = body.plan
      if (body.plan !== 'free') {
        return NextResponse.json(
          { error: 'Paid subscription updates require live billing integration.' },
          { status: 501 },
        )
      }
      updates.amount = 0
      updates.currency = 'nzd'
      updates.status = 'active'
    }

    if (body.billingInterval) {
      updates.billingInterval = body.billingInterval
    }

    if (typeof body.cancelAtPeriodEnd === 'boolean') {
      updates.cancelAtPeriodEnd = body.cancelAtPeriodEnd
      if (!body.cancelAtPeriodEnd) {
        updates.status = 'active'
        updates.canceledAt = null
      }
    }

    await ref.update(updates)

    return NextResponse.json(
      serializeSubscription(subscriptionId, {
        ...(snap.data() as Record<string, unknown>),
        ...updates,
      }),
    )
  } catch (error) {
    console.error('PUT /api/subscriptions/[subscriptionId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ subscriptionId: string }> },
) {
  const params = await context.params
  try {
    const { subscriptionId } = params

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    const { adminDb } = await import('@/lib/firebase-admin')
    const ref = adminDb.collection('subscriptions').doc(subscriptionId)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const canceledAt = new Date().toISOString()
    const updates = {
      status: 'canceled',
      cancelAtPeriodEnd: true,
      canceledAt,
      updatedAt: canceledAt,
    }

    await ref.update(updates)

    return NextResponse.json(
      serializeSubscription(subscriptionId, {
        ...(snap.data() as Record<string, unknown>),
        ...updates,
      }),
    )
  } catch (error) {
    console.error('DELETE /api/subscriptions/[subscriptionId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
