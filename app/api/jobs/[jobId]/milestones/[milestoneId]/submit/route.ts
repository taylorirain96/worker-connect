/**
 * POST /api/jobs/[jobId]/milestones/[milestoneId]/submit
 *
 * Worker marks a milestone as complete and submits it for employer approval.
 * Body: { submissionNote?: string; submissionPhotos?: string[] }
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'
import type { JobMilestone } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ jobId: string; milestoneId: string }> }
) {
  const params = await props.params;
  const { jobId, milestoneId } = params
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

  try {
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    const job = jobSnap.data()!

    // Only the assigned worker may submit milestones
    if (job.assignedWorkerId !== userId) {
      return NextResponse.json({ error: 'Only the assigned worker can submit milestones' }, { status: 403 })
    }

    const mRef = adminDb.collection('jobs').doc(jobId).collection('milestones').doc(milestoneId)
    const mSnap = await mRef.get()
    if (!mSnap.exists) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })

    const milestone = mSnap.data() as JobMilestone
    if (!['pending', 'in_progress', 'rejected'].includes(milestone.status)) {
      return NextResponse.json(
        { error: `Cannot submit a milestone with status '${milestone.status}'` },
        { status: 400 }
      )
    }

    const body = (await req.json()) as {
      submissionNote?: string
      submissionPhotos?: string[]
    }

    const now = new Date().toISOString()
    await mRef.update({
      status: 'submitted',
      submittedAt: now,
      submissionNote: body.submissionNote ?? null,
      submissionPhotos: body.submissionPhotos ?? [],
      updatedAt: now,
    })

    // Notify the employer
    await sendNotification({
      userId: job.employerId as string,
      type: 'job_status_change',
      title: 'Milestone Ready for Review ✅',
      message: `"${milestone.title}" on job "${job.title as string}" has been submitted for your approval.`,
      metadata: { jobId, milestoneId },
      actionUrl: `/dashboard/homeowner/jobs/${jobId}/milestones`,
    })

    return NextResponse.json({ success: true, milestoneId, status: 'submitted' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
