import { NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/types/payment'

/**
 * GET /api/subscriptions/plans
 * Returns all available subscription plan configurations.
 */
export async function GET() {
  try {
    return NextResponse.json({ plans: SUBSCRIPTION_PLANS })
  } catch (error) {
    console.error('GET /api/subscriptions/plans error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
