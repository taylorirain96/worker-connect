import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SubscriptionPlanDetails, CreateSubscriptionRequest } from '@/types/payment'

export const dynamic = 'force-dynamic'

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'usd',
    features: [
      'Up to 3 active jobs',
      'Up to 5 applications per month',
      'Basic job matching',
      'Standard support',
    ],
    maxJobs: 3,
    maxApplications: 5,
    analyticsAccess: false,
    prioritySupport: false,
    apiAccess: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing professionals',
    priceMonthly: 29,
    priceYearly: 290,
    currency: 'usd',
    features: [
      'Unlimited active jobs',
      'Unlimited applications',
      'Advanced job matching',
      'Payment analytics',
      'Priority support',
      'Profile badge',
    ],
    maxJobs: null,
    maxApplications: null,
    analyticsAccess: true,
    prioritySupport: true,
    apiAccess: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and businesses',
    priceMonthly: 99,
    priceYearly: 990,
    currency: 'usd',
    features: [
      'Everything in Pro',
      'API access',
      'Dedicated account manager',
      'Custom contracts',
      'White-label options',
      'SLA guarantee',
    ],
    maxJobs: null,
    maxApplications: null,
    analyticsAccess: true,
    prioritySupport: true,
    apiAccess: true,
  },
]

/**
 * POST /api/subscriptions/create
 * Creates or upgrades a user subscription.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreateSubscriptionRequest>
    const { userId, plan, billingCycle = 'monthly' } = body

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Missing required fields: userId, plan' }, { status: 400 })
    }

    const planDetails = SUBSCRIPTION_PLANS.find((p) => p.id === plan)
    if (!planDetails) {
      return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 })
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1))

    const price = billingCycle === 'yearly' ? planDetails.priceYearly : planDetails.priceMonthly

    // In production: create Stripe subscription
    // const stripe = getStripe()
    // const subscription = await stripe.subscriptions.create({ ... })

    const subscription = {
      id: `sub_mock_${Date.now()}`,
      userId,
      plan,
      status: 'active' as const,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      priceMonthly: price,
      currency: 'usd' as const,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('POST /api/subscriptions/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/subscriptions/create — return available plans
 */
export async function GET() {
  return NextResponse.json({ plans: SUBSCRIPTION_PLANS })
}
