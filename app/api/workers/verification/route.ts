/**
 * Worker Verification API routes.
 *
 * POST /api/workers/verification  (action: start | upload)
 * GET  /api/workers/verification  — list verifications for a worker
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  createVerification,
  getWorkerVerifications,
  submitVerificationDocument,
} from '@/lib/services/onboardingService'
import type { WorkerVerificationRecord } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/workers/verification?workerId=xxx — list all verification attempts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = request.headers.get('x-user-id') || searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    const verifications = await getWorkerVerifications(workerId)
    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('[verification] GET error:', error)
    return NextResponse.json({ error: 'Failed to retrieve verifications' }, { status: 500 })
  }
}

// POST /api/workers/verification — start or upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workerId, verificationType, verificationId, documentUrl, metadata } =
      body as {
        action: 'start' | 'upload'
        workerId?: string
        verificationType?: WorkerVerificationRecord['type']
        verificationId?: string
        documentUrl?: string
        metadata?: Record<string, unknown>
      }

    const resolvedWorkerId = workerId || request.headers.get('x-user-id')

    if (action === 'upload') {
      if (!verificationId || !documentUrl) {
        return NextResponse.json(
          { error: 'verificationId and documentUrl are required' },
          { status: 400 }
        )
      }
      await submitVerificationDocument(verificationId, documentUrl, metadata)
      return NextResponse.json({ success: true, verificationId, status: 'submitted' })
    }

    // Default: start
    if (!resolvedWorkerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }
    if (!verificationType) {
      return NextResponse.json({ error: 'verificationType is required' }, { status: 400 })
    }

    const validTypes: WorkerVerificationRecord['type'][] = [
      'government_id',
      'background_check',
      'insurance',
      'certification',
      'bbb',
    ]
    if (!validTypes.includes(verificationType)) {
      return NextResponse.json({ error: 'Invalid verificationType' }, { status: 400 })
    }

    const verificationId_ = await createVerification(resolvedWorkerId, verificationType)
    return NextResponse.json({ verificationId: verificationId_, status: 'pending' })
  } catch (error) {
    console.error('[verification] POST error:', error)
    return NextResponse.json({ error: 'Failed to process verification request' }, { status: 500 })
  }
}
