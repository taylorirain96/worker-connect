/**
 * POST  /api/jobs/[jobId]/dispute  — Open a dispute (worker or employer)
 * PATCH /api/jobs/[jobId]/dispute  — Resolve a dispute (admin only)
 *
 * POST body:  { openedBy: string, reason: string }
 * PATCH body: { resolvedBy: string, resolution: 'release_to_worker' | 'refund_to_employer' }
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getJobEscrow, openDispute, resolveDispute } from '@/lib/services/escrowService'
import { sendNotification } from '@/lib/notificationService'
import { rateLimit } from '@/lib/rateLimit'
import type { EscrowDisputeResolution } from '@/types'

export const dynamic = 'force-dynamic'

// ─── POST — open a dispute ────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ jobId: string }> }
) {
  if (rateLimit(request, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  const { jobId } = await props.params

  try {
    const body = await request.json() as { openedBy?: string; reason?: string }
    const { openedBy, reason } = body

    if (!openedBy || !reason?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: openedBy, reason' },
        { status: 400 }
      )
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    // ── Fetch job ─────────────────────────────────────────────────────────────
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const jobData = jobSnap.data()!

    if (jobData.status === 'disputed') {
      return NextResponse.json({ error: 'A dispute is already open for this job' }, { status: 409 })
    }

    if (!['in_progress', 'completed'].includes(jobData.status as string)) {
      return NextResponse.json(
        { error: `Cannot open a dispute for a job with status '${jobData.status as string}'. Job must be in_progress or completed.` },
        { status: 400 }
      )
    }

    // ── Authorise — only the assigned worker or employer may open a dispute ───
    const isWorker = jobData.assignedWorkerId === openedBy
    const isEmployer = jobData.employerId === openedBy
    if (!isWorker && !isEmployer) {
      return NextResponse.json(
        { error: 'Only the assigned worker or employer can open a dispute' },
        { status: 403 }
      )
    }

    // ── Fetch escrow ──────────────────────────────────────────────────────────
    const escrow = await getJobEscrow(jobId)
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow record not found for this job' }, { status: 404 })
    }

    // ── Transition state ──────────────────────────────────────────────────────
    await openDispute(escrow.id, jobId, openedBy, reason.trim())

    // ── Notify the other party and admin ──────────────────────────────────────
    const openerRole = isWorker ? 'worker' : 'employer'
    const otherId = isWorker ? jobData.employerId as string : jobData.assignedWorkerId as string | undefined

    await sendNotification({
      userId: 'admin',
      title: 'New dispute opened',
      message: `A dispute was opened on job "${jobData.title as string}" by the ${openerRole}.`,
      type: 'dispute_opened',
      jobId,
    })

    if (otherId) {
      await sendNotification({
        userId: otherId,
        title: 'Dispute opened on your job',
        message: `The ${openerRole} has opened a dispute on "${jobData.title as string}". An admin will review and contact both parties.`,
        type: 'dispute_opened',
        jobId,
      })
    }

    return NextResponse.json({ success: true, jobId, escrowId: escrow.id }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── PATCH — resolve a dispute (admin only) ───────────────────────────────────

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ jobId: string }> }
) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  const { jobId } = await props.params

  try {
    const body = await request.json() as {
      resolvedBy?: string
      resolution?: EscrowDisputeResolution
    }
    const { resolvedBy, resolution } = body

    if (!resolvedBy || !resolution) {
      return NextResponse.json(
        { error: 'Missing required fields: resolvedBy, resolution' },
        { status: 400 }
      )
    }

    const VALID_RESOLUTIONS: EscrowDisputeResolution[] = ['release_to_worker', 'refund_to_employer']
    if (!VALID_RESOLUTIONS.includes(resolution)) {
      return NextResponse.json(
        { error: `Invalid resolution. Must be one of: ${VALID_RESOLUTIONS.join(', ')}` },
        { status: 400 }
      )
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    // ── Verify caller is admin ────────────────────────────────────────────────
    const adminSnap = await adminDb.collection('users').doc(resolvedBy).get()
    if (!adminSnap.exists || (adminSnap.data() as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 })
    }

    // ── Fetch job ─────────────────────────────────────────────────────────────
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const jobData = jobSnap.data()!

    if (jobData.status !== 'disputed') {
      return NextResponse.json(
        { error: `Job is not in a disputed state (current status: '${jobData.status as string}')` },
        { status: 400 }
      )
    }

    // ── Fetch escrow ──────────────────────────────────────────────────────────
    const escrow = await getJobEscrow(jobId)
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow record not found for this job' }, { status: 404 })
    }

    // ── Transition state ──────────────────────────────────────────────────────
    await resolveDispute(escrow.id, jobId, resolution, resolvedBy)

    // ── Notify both parties ───────────────────────────────────────────────────
    const resolutionLabel =
      resolution === 'release_to_worker' ? 'Funds released to the worker' : 'Funds refunded to the employer'

    for (const userId of [jobData.employerId as string, jobData.assignedWorkerId as string | undefined].filter(Boolean) as string[]) {
      await sendNotification({
        userId,
        title: 'Dispute resolved',
        message: `The dispute on "${jobData.title as string}" has been resolved by an admin. ${resolutionLabel}.`,
        type: 'dispute_resolved',
        jobId,
      })
    }

    return NextResponse.json(
      { success: true, jobId, escrowId: escrow.id, resolution },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
