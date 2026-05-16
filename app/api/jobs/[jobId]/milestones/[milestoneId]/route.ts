/**
 * GET    /api/jobs/[jobId]/milestones/[milestoneId]  — get a single milestone
 * PUT    /api/jobs/[jobId]/milestones/[milestoneId]  — update title/description/amount/dueDate
 * DELETE /api/jobs/[jobId]/milestones/[milestoneId]  — delete (only if still pending)
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { JobMilestone } from '@/types'

export const dynamic = 'force-dynamic'

function milestoneRef(jobId: string, milestoneId: string) {
  return adminDb!.collection('jobs').doc(jobId).collection('milestones').doc(milestoneId)
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ jobId: string; milestoneId: string }> }
) {
  const params = await props.params;
  const { jobId, milestoneId } = params

  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  try {
    const snap = await milestoneRef(jobId, milestoneId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }
    return NextResponse.json({ milestone: { id: snap.id, ...snap.data() } as JobMilestone })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ jobId: string; milestoneId: string }> }
) {
  const params = await props.params;
  const { jobId, milestoneId } = params
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

  try {
    const snap = await milestoneRef(jobId, milestoneId).get()
    if (!snap.exists) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })

    const milestone = snap.data() as JobMilestone

    // Only allow editing pending or in_progress milestones
    if (milestone.status === 'approved') {
      return NextResponse.json({ error: 'Cannot edit an approved milestone' }, { status: 400 })
    }

    // Verify caller is the employer or assigned worker
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    const job = jobSnap.data()
    if (!job || (job.employerId !== userId && job.assignedWorkerId !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await req.json()) as Partial<Pick<JobMilestone, 'title' | 'description' | 'amount' | 'percentage' | 'dueDate' | 'order'>>
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
    if (body.title !== undefined) updates.title = body.title.trim()
    if (body.description !== undefined) updates.description = body.description.trim()
    if (body.amount !== undefined) updates.amount = body.amount
    if (body.percentage !== undefined) updates.percentage = body.percentage
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate
    if (body.order !== undefined) updates.order = body.order

    await milestoneRef(jobId, milestoneId).update(updates)

    return NextResponse.json({ milestone: { id: milestoneId, ...updates } })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ jobId: string; milestoneId: string }> }
) {
  const params = await props.params;
  const { jobId, milestoneId } = params
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

  try {
    const snap = await milestoneRef(jobId, milestoneId).get()
    if (!snap.exists) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })

    const milestone = snap.data() as JobMilestone
    if (milestone.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending milestones can be deleted' },
        { status: 400 }
      )
    }

    // Verify caller is employer
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    const job = jobSnap.data()
    if (!job || job.employerId !== userId) {
      return NextResponse.json({ error: 'Forbidden — only the employer can delete milestones' }, { status: 403 })
    }

    await milestoneRef(jobId, milestoneId).delete()
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
