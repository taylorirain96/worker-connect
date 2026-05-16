import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'
import * as admin from 'firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * Worker opt-out from a recurring job series.
 *
 * Adds the worker's UID to `recurringOptOutWorkerIds` on both the current job
 * and its parent (root) recurring job. The recurring-jobs cron will then drop
 * `assignedWorkerId` from any new occurrences cloned from a job whose assigned
 * worker has opted out, returning the new occurrence to the open marketplace.
 *
 * The current job listing itself is NOT modified beyond the opt-out array, so
 * the worker still completes any work already in progress.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
  if (rateLimit(request, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { jobId } = await context.params
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
    }

    const jobRef = adminDb.collection('jobs').doc(jobId)
    const jobSnap = await jobRef.get()
    if (!jobSnap.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const job = jobSnap.data() as {
      assignedWorkerId?: string
      recurring?: boolean
      parentJobId?: string
    }

    if (job.assignedWorkerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!job.recurring && !job.parentJobId) {
      return NextResponse.json(
        { error: 'Job is not part of a recurring series' },
        { status: 400 },
      )
    }

    const nowIso = new Date().toISOString()
    await jobRef.update({
      recurringOptOutWorkerIds: admin.firestore.FieldValue.arrayUnion(userId),
      updatedAt: nowIso,
    })

    // Propagate to the parent so future occurrences cloned from the parent are
    // also unassigned. If this job IS the parent (recurring=true, no parentJobId),
    // the update above is sufficient.
    if (job.parentJobId && job.parentJobId !== jobId) {
      const parentRef = adminDb.collection('jobs').doc(job.parentJobId)
      const parentSnap = await parentRef.get()
      if (parentSnap.exists) {
        await parentRef.update({
          recurringOptOutWorkerIds: admin.firestore.FieldValue.arrayUnion(userId),
          updatedAt: nowIso,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Recurring opt-out error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
