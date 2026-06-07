import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SubscriptionPlan } from '@/types/payment'
import { serializeSubscription } from '@/lib/server/firestoreSerializers'

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
