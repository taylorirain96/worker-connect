/**
 * Worker Onboarding Progress API routes.
 *
 * GET  /api/workers/onboarding  (action: progress | checklist)
 * POST /api/workers/onboarding  — complete a step
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getOnboardingProgress,
  completeOnboardingStep,
  getOnboardingChecklist,
} from '@/lib/services/onboardingService'

export const dynamic = 'force-dynamic'

// GET /api/workers/onboarding?workerId=xxx&action=progress|checklist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = request.headers.get('x-user-id') || searchParams.get('workerId')
    const action = searchParams.get('action') ?? 'progress'

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    if (action === 'checklist') {
      const checklist = await getOnboardingChecklist(workerId)
      return NextResponse.json({ checklist })
    }

    // Default: progress
    const { items } = await getOnboardingProgress(workerId)
    return NextResponse.json(items)
  } catch (error) {
    console.error('[onboarding] GET error:', error)
    return NextResponse.json({ error: 'Failed to retrieve onboarding progress' }, { status: 500 })
  }
}

// POST /api/workers/onboarding — complete a step
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workerId, step, data } = body as {
      workerId?: string
      step?: string
      data?: Record<string, unknown>
    }

    const resolvedWorkerId = workerId || request.headers.get('x-user-id')

    if (!resolvedWorkerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }
    if (!step) {
      return NextResponse.json({ error: 'step is required' }, { status: 400 })
    }

    const completion = await completeOnboardingStep(resolvedWorkerId, step, data ?? {})
    return NextResponse.json({ success: true, completion, step })
  } catch (error) {
    console.error('[onboarding] POST error:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding step' }, { status: 500 })
  }
}
