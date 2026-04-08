/**
 * Stripe Connect API routes for worker onboarding.
 *
 * POST /api/workers/stripe-connect  (action: initialize | refresh)
 * GET  /api/workers/stripe-connect  (action: status)
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  initializeStripeConnect,
  getStripeConnectStatus,
  refreshStripeConnectStatus,
} from '@/lib/services/onboardingService'

export const dynamic = 'force-dynamic'

// GET /api/workers/stripe-connect?workerId=xxx  — check account status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = request.headers.get('x-user-id') || searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    const status = await getStripeConnectStatus(workerId)
    return NextResponse.json(status)
  } catch (error) {
    console.error('[stripe-connect] GET error:', error)
    return NextResponse.json({ error: 'Failed to retrieve Stripe Connect status' }, { status: 500 })
  }
}

// POST /api/workers/stripe-connect  — initialize or refresh
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workerId, email, country } = body as {
      action: 'initialize' | 'refresh'
      workerId?: string
      email?: string
      country?: string
    }

    const resolvedWorkerId = workerId || request.headers.get('x-user-id')

    if (!resolvedWorkerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    if (action === 'refresh') {
      const status = await refreshStripeConnectStatus(resolvedWorkerId)
      return NextResponse.json(status)
    }

    // Default: initialize
    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const result = await initializeStripeConnect(
      resolvedWorkerId,
      email,
      country ?? 'US'
    )

    console.info(`[stripe-connect] initialized for worker=${resolvedWorkerId} account=${result.accountId}`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[stripe-connect] POST error:', error)
    return NextResponse.json({ error: 'Failed to process Stripe Connect request' }, { status: 500 })
  }
}
