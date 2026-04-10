/**
 * Verification admin actions.
 *
 * PUT /api/workers/verification/[verificationId]  (action: approve | reject)
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { approveVerification, rejectVerification } from '@/lib/services/onboardingService'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ verificationId: string }> }
) {
  const params = await context.params
  try {
    const verificationId = params.verificationId
    if (!verificationId) {
      return NextResponse.json({ error: 'verificationId is required' }, { status: 400 })
    }

    const body = await request.json()
    const { action, notes, reason } = body as {
      action: 'approve' | 'reject'
      notes?: string
      reason?: string
    }

    if (action === 'approve') {
      await approveVerification(verificationId, notes ?? '')
      return NextResponse.json({ success: true, verificationId, status: 'approved' })
    }

    if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'reason is required for rejection' }, { status: 400 })
      }
      await rejectVerification(verificationId, reason)
      return NextResponse.json({ success: true, verificationId, status: 'rejected' })
    }

    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  } catch (error) {
    console.error('[verification][verificationId] PUT error:', error)
    return NextResponse.json({ error: 'Failed to process verification action' }, { status: 500 })
  }
}
