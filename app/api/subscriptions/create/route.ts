import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SubscriptionPlan } from '@/types/payment'
import { rateLimit } from '@/lib/rateLimit'

/**
 * POST /api/subscriptions/create
 * Creates a new subscription for a user.
 */
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
      return NextResponse.json({ error: 'Missing required fields: userId, plan' }, { status: 400 })
    }

    if (plan !== 'free') {
      return NextResponse.json(
        { error: 'Paid subscription checkout is not wired yet. Mock subscriptions have been removed.' },
        { status: 501 },
      )
    }

    const forward = await fetch(new URL('/api/subscriptions', req.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, plan, billingInterval }),
      cache: 'no-store',
    })

    const payload = await forward.json()
    return NextResponse.json(payload, { status: forward.status })
  } catch (error) {
    console.error('POST /api/subscriptions/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
