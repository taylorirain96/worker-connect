import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET    /api/subscriptions/[id]  — get subscription details
 * PUT    /api/subscriptions/[id]  — update subscription (plan change, billing interval)
 * DELETE /api/subscriptions/[id]  — cancel subscription
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    // In production: fetch from Firestore or Stripe
    // const snap = await getDoc(doc(db, 'subscriptions', id))
    // if (!snap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const mockSub = {
      id,
      userId: 'user_1',
      plan: 'pro',
      status: 'active',
      billingInterval: 'month',
      amount: 29,
      currency: 'usd',
      stripeSubscriptionId: `sub_stripe_${id}`,
      currentPeriodStart: new Date(Date.now() - 10 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 20 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ subscription: mockSub })
  } catch (error) {
    console.error('GET /api/subscriptions/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json() as {
      plan?: string
      billingInterval?: 'month' | 'year'
      cancelAtPeriodEnd?: boolean
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    // In production:
    // const stripe = getStripe()
    // const updates: Stripe.SubscriptionUpdateParams = {}
    // if (body.plan) updates.items = [{ price: PLAN_PRICE_IDS[body.plan][body.billingInterval ?? 'month'] }]
    // if (body.cancelAtPeriodEnd !== undefined) updates.cancel_at_period_end = body.cancelAtPeriodEnd
    // const sub = await stripe.subscriptions.update(stripeSubId, updates)
    // Update Firestore record

    return NextResponse.json({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('PUT /api/subscriptions/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    // In production:
    // const stripe = getStripe()
    // await stripe.subscriptions.update(stripeSubId, { cancel_at_period_end: true })
    // Update Firestore: { cancelAtPeriodEnd: true, status: 'canceled' }

    return NextResponse.json({
      id,
      status: 'canceled',
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
