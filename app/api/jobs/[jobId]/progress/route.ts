/**
 * GET  /api/jobs/[jobId]/progress  — list progress updates for a job
 * POST /api/jobs/[jobId]/progress  — worker posts a progress update
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'
import type { JobProgressUpdate } from '@/types'

export const dynamic = 'force-dynamic'

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  const { jobId } = params
  if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

  try {
    const snap = await adminDb
      .collection('jobs')
      .doc(jobId)
      .collection('progressUpdates')
      .orderBy('createdAt', 'desc')
      .get()

    const updates: JobProgressUpdate[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<JobProgressUpdate, 'id'>),
    } as JobProgressUpdate))

    return NextResponse.json({ updates })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  const { jobId } = params
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

  try {
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    const job = jobSnap.data()!

    // Only the assigned worker may post progress updates
    if (job.assignedWorkerId !== userId) {
      return NextResponse.json(
        { error: 'Only the assigned worker can post progress updates' },
        { status: 403 }
      )
    }

    const body = (await req.json()) as {
      message?: string
      photos?: string[]
      milestoneId?: string
    }

    const { message, photos, milestoneId } = body
    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    // Fetch worker name / avatar
    const workerSnap = await adminDb.collection('users').doc(userId).get()
    const workerData = workerSnap.data() ?? {}

    const now = new Date().toISOString()
    const data: Omit<JobProgressUpdate, 'id'> = {
      jobId,
      workerId: userId,
      workerName: (workerData.displayName as string) ?? 'Worker',
      workerAvatar: (workerData.photoURL as string | undefined) ?? undefined,
      message: message.trim(),
      photos: photos ?? [],
      ...(milestoneId ? { milestoneId } : {}),
      createdAt: now,
    }

    const ref = await adminDb
      .collection('jobs')
      .doc(jobId)
      .collection('progressUpdates')
      .add(data)

    await adminDb.collection('jobs').doc(jobId).update({
      workflowStage: 'job_in_progress',
      updatedAt: now,
    })

    // Notify the employer
    await sendNotification({
      userId: job.employerId as string,
      type: 'job_status_change',
      title: 'New Progress Update 📸',
      message: `${data.workerName} posted an update on "${job.title as string}": ${message.trim().slice(0, 80)}${message.length > 80 ? '…' : ''}`,
      metadata: { jobId, updateId: ref.id },
      actionUrl: `/dashboard/homeowner/jobs/${jobId}/milestones`,
    })

    return NextResponse.json({ update: { id: ref.id, ...data } }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
