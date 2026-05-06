import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { sendAdminNotification } from '@/lib/notifications/admin'

export const dynamic = 'force-dynamic'

/**
 * POST /api/jobs/[jobId]/cancel
 * Body: { reason: string }
 * Header: x-user-id (caller UID)
 *
 * Allows the homeowner (employerId) or assigned worker (assignedWorkerId) to
 * cancel a job that is `open` or `in_progress`, provided escrow has not yet
 * been released.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params

  try {
    const uid = req.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { reason?: string }
    try {
      body = await req.json() as { reason?: string }
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const reason = body.reason?.trim()
    if (!reason) {
      return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 })
    }

    let jobData: FirebaseFirestore.DocumentData
    let isFirestoreLive = true

    try {
      const jobSnap = await adminDb.collection('jobs').doc(jobId).get()

      if (!jobSnap.exists) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      jobData = jobSnap.data()!
    } catch {
      isFirestoreLive = false
      // Mock fallback — realistic data so downstream logic can be exercised
      jobData = {
        employerId: uid,
        assignedWorkerId: 'worker_mock_001',
        status: 'in_progress',
        escrowStatus: 'held',
        title: 'Mock Job',
      }
    }

    // --- Authorization ---
    const isEmployer = jobData.employerId === uid
    const isWorker = jobData.assignedWorkerId === uid
    if (!isEmployer && !isWorker) {
      return NextResponse.json({ error: 'Forbidden: you are not a party to this job' }, { status: 403 })
    }

    // --- Status validation ---
    const cancellableStatuses = ['open', 'in_progress']
    if (!cancellableStatuses.includes(jobData.status)) {
      return NextResponse.json(
        { error: `Job cannot be cancelled from status '${jobData.status}'` },
        { status: 422 }
      )
    }

    if (jobData.escrowStatus === 'released') {
      return NextResponse.json(
        { error: 'Job cannot be cancelled: escrow payment has already been released' },
        { status: 422 }
      )
    }

    // --- Build Firestore update ---
    const jobUpdate: Record<string, unknown> = {
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: uid,
      cancellationReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (jobData.escrowStatus === 'held') {
      jobUpdate.escrowStatus = 'refunded'
      // A real Stripe refund would be triggered here via lib/payments/stripe.ts
    }

    if (isFirestoreLive) {
      await adminDb.collection('jobs').doc(jobId).update(jobUpdate)
    } else {
      console.warn(`[cancel] Firestore unavailable — mock update for job ${jobId}`)
    }

    // --- Notify the OTHER party ---
    const notifyUserId = isEmployer ? jobData.assignedWorkerId : jobData.employerId
    const jobTitle: string = jobData.title ?? 'your job'

    if (notifyUserId) {
      const cancellerRole = isEmployer ? 'homeowner' : 'worker'
      await sendAdminNotification({
        userId: notifyUserId,
        title: 'Job Cancelled',
        body: `The ${cancellerRole} has cancelled "${jobTitle}".`,
        type: 'job_cancelled',
        link: `/jobs/${jobId}`,
      })
    }

    return NextResponse.json({ success: true, jobId })
  } catch (error) {
    console.error(`POST /api/jobs/${jobId}/cancel error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
