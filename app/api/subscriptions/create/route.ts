import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SubscriptionPlan } from '@/types/payment'

/**
 * POST /api/subscriptions/create
 * Creates a new subscription for a user.
 */
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
      return NextResponse.json({ error: 'Missing required fields: userId, plan' }, { status: 400 })
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
    // 1. Create or retrieve Stripe customer for userId
    // 2. Attach paymentMethodId to customer
    // 3. Create Stripe subscription with the correct price ID
    // 4. Persist subscription record in Firestore
    void paymentMethodId

    const PLAN_AMOUNTS: Record<SubscriptionPlan, Record<string, number>> = {
      free: { month: 0, year: 0 },
      pro: { month: 29, year: 26 },
      enterprise: { month: 99, year: 89 },
    }

    const amount = PLAN_AMOUNTS[plan][billingInterval] ?? 0
    const now = new Date()
    const periodEnd = new Date(
      now.getTime() + (billingInterval === 'year' ? 365 : 30) * 86400000
    )

    return NextResponse.json(
      {
        id: `sub_${Date.now()}`,
        userId,
        plan,
        status: 'active',
        billingInterval,
        amount,
        currency: 'usd',
        stripeSubscriptionId: `sub_stripe_mock_${Date.now()}`,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/subscriptions/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
