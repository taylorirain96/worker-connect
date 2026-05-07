/**
 * POST /api/escrow/release
 *
 * Lightweight proxy used by the job-completion UI. Verifies that the caller
 * is the homeowner for the given job and then delegates to the existing
 * /api/jobs/[jobId]/complete route which handles the full escrow-release flow.
 *
 * Body: { jobId: string, completedBy: string }
 *
 * Returns exactly what /api/jobs/[jobId]/complete returns, forwarding any
 * 207 partial-success responses as-is.
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { jobId?: string; completedBy?: string }
    const { jobId, completedBy } = body

    if (!jobId || !completedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId and completedBy' },
        { status: 400 }
      )
    }

    // Verify the caller is the homeowner / employer for this job
    if (adminDb) {
      const jobSnap = await adminDb.collection('jobs').doc(jobId).get()

      if (!jobSnap.exists) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      const jobData = jobSnap.data()!
      if (jobData.employerId !== completedBy) {
        return NextResponse.json(
          { error: 'Only the homeowner can release escrow for this job' },
          { status: 403 }
        )
      }
    }

    // Delegate to the job-complete route which handles the full escrow-release logic
    const baseUrl = request.nextUrl.origin
    const completeRes = await fetch(`${baseUrl}/api/jobs/${jobId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedBy }),
    })

    const data = await completeRes.json() as Record<string, unknown>

    return NextResponse.json(data, { status: completeRes.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/escrow/release error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
