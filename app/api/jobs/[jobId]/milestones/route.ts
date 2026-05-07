/**
 * GET  /api/jobs/[jobId]/milestones  — list all milestones for a job
 * POST /api/jobs/[jobId]/milestones  — create a new milestone (worker or employer)
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { JobMilestone } from '@/types'

export const dynamic = 'force-dynamic'

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params

  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  try {
    const snap = await adminDb
      .collection('jobs')
      .doc(jobId)
      .collection('milestones')
      .orderBy('order', 'asc')
      .get()

    const milestones: JobMilestone[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<JobMilestone, 'id'>),
    } as JobMilestone))

    return NextResponse.json({ milestones })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  try {
    const body = (await req.json()) as {
      title?: string
      description?: string
      amount?: number
      percentage?: number
      dueDate?: string
    }

    const { title, description, amount, percentage, dueDate } = body

    if (!title || typeof amount !== 'number' || typeof percentage !== 'number') {
      return NextResponse.json(
        { error: 'title, amount, and percentage are required' },
        { status: 400 }
      )
    }

    if (percentage < 1 || percentage > 100) {
      return NextResponse.json(
        { error: 'percentage must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Verify caller is the employer or assigned worker on this job
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const job = jobSnap.data()!
    if (job.employerId !== userId && job.assignedWorkerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine order (append after existing milestones)
    const existingSnap = await adminDb
      .collection('jobs')
      .doc(jobId)
      .collection('milestones')
      .orderBy('order', 'desc')
      .limit(1)
      .get()

    const nextOrder = existingSnap.empty
      ? 1
      : ((existingSnap.docs[0].data().order as number) ?? 0) + 1

    const now = new Date().toISOString()
    const data: Omit<JobMilestone, 'id'> = {
      jobId,
      title: title.trim(),
      description: description?.trim(),
      amount,
      percentage,
      status: 'pending',
      order: nextOrder,
      ...(dueDate ? { dueDate } : {}),
      createdAt: now,
      updatedAt: now,
    }

    const ref = await adminDb
      .collection('jobs')
      .doc(jobId)
      .collection('milestones')
      .add(data)

    return NextResponse.json({ milestone: { id: ref.id, ...data } }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
