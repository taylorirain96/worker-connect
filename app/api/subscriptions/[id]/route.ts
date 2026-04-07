import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UpdateSubscriptionRequest } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * GET /api/subscriptions/[id]  — fetch subscription details
 * PUT /api/subscriptions/[id]  — update plan or cancel
 */

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    // In production: fetch from Firestore / Stripe
    // const stripe = getStripe()
    // const sub = await stripe.subscriptions.retrieve(id)

    return NextResponse.json({
      subscription: {
        id,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        cancelAtPeriodEnd: false,
      },
    })
  } catch (error) {
    console.error(`GET /api/subscriptions/${params.id} error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    const body = (await req.json()) as Partial<UpdateSubscriptionRequest>
    const { plan, cancelAtPeriodEnd, paymentMethodId } = body

    if (plan === undefined && cancelAtPeriodEnd === undefined && paymentMethodId === undefined) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 })
    }

    // In production:
    // const stripe = getStripe()
    // const updates: Stripe.SubscriptionUpdateParams = {}
    // if (plan) updates.items = [{ id: existingItemId, price: PRICE_IDS[plan] }]
    // if (cancelAtPeriodEnd !== undefined) updates.cancel_at_period_end = cancelAtPeriodEnd
    // const sub = await stripe.subscriptions.update(id, updates)

    return NextResponse.json({
      subscription: {
        id,
        plan: plan ?? 'pro',
        status: cancelAtPeriodEnd ? 'active' : 'active',
        cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error(`PUT /api/subscriptions/${params.id} error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 })
    }

    // In production: cancel at period end via Stripe
    // const stripe = getStripe()
    // await stripe.subscriptions.update(id, { cancel_at_period_end: true })

    return NextResponse.json({
      subscription: {
        id,
        status: 'active',
        cancelAtPeriodEnd: true,
        canceledAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error(`DELETE /api/subscriptions/${params.id} error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
