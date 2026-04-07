import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SubscriptionPlan } from '@/types/payment'

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

    // In production: fetch from Firestore
    // const snap = await getDocs(query(collection(db, 'subscriptions'), where('userId', '==', userId), limit(1)))
    // if (snap.empty) return NextResponse.json({ subscription: null })
    // return NextResponse.json({ subscription: snap.docs[0].data() })

    const mockSubscription = {
      id: `sub_mock_${userId}`,
      userId,
      plan: 'free' as SubscriptionPlan,
      status: 'active',
      billingInterval: 'month',
      amount: 0,
      currency: 'usd',
      currentPeriodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ subscription: mockSubscription })
  } catch (error) {
    console.error('GET /api/subscriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId?: string
      plan?: SubscriptionPlan
      billingInterval?: 'month' | 'year'
      paymentMethodId?: string
    }

    const { userId, plan, billingInterval = 'month', paymentMethodId } = body

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validPlans: SubscriptionPlan[] = ['free', 'pro', 'enterprise']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey && plan !== 'free') {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // In production:
    // const stripe = getStripe()
    // const priceId = PLAN_PRICE_IDS[plan][billingInterval]
    // const subscription = await stripe.subscriptions.create({
    //   customer: stripeCustomerId,
    //   items: [{ price: priceId }],
    //   default_payment_method: paymentMethodId,
    //   expand: ['latest_invoice.payment_intent'],
    // })
    // Store subscription in Firestore

    void paymentMethodId

    const PLAN_AMOUNTS: Record<SubscriptionPlan, Record<string, number>> = {
      free: { month: 0, year: 0 },
      pro: { month: 29, year: 26 },
      enterprise: { month: 99, year: 89 },
    }

    const amount = PLAN_AMOUNTS[plan][billingInterval] ?? 0

    return NextResponse.json(
      {
        id: `sub_mock_${Date.now()}`,
        userId,
        plan,
        status: 'active',
        billingInterval,
        amount,
        currency: 'usd',
        stripeSubscriptionId: `sub_stripe_mock_${Date.now()}`,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + (billingInterval === 'year' ? 365 : 30) * 86400000
        ).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/subscriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
