import { NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/app/api/subscriptions/create/route'

export const dynamic = 'force-dynamic'

/**
 * GET /api/subscriptions/plans
 * Returns the list of available subscription plans.
 */
export async function GET() {
  return NextResponse.json({ plans: SUBSCRIPTION_PLANS })
}
