/**
 * POST /api/jobs/[jobId]/request-completion
 *
 * Called by the assigned worker to request the homeowner confirm job completion.
 * Sends an email + in-app notification to the homeowner.
 *
 * Body: { requestedBy: string }  — UID of the worker making the request
 *
 * If the homeowner doesn't respond within 48 hours after the request, admin is
 * notified via a Firestore flag (completionRequestedAt) that can be picked up
 * by a scheduled job or admin dashboard.
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'
import { sendPaymentReleaseRequestEmail } from '@/lib/email/transactional'
import { rateLimit } from '@/lib/rateLimit'

/** 48 hours in milliseconds — how long before admin is notified of an unresponded completion request */
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  if (rateLimit(request, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  const { jobId } = params

  try {
    const body = await request.json() as { requestedBy?: string }
    const { requestedBy } = body

    if (!requestedBy) {
      return NextResponse.json(
        { error: 'Missing required field: requestedBy' },
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

    if (jobData.status === 'completed') {
      return NextResponse.json({ error: 'Job is already marked as complete' }, { status: 400 })
    }

    if (jobData.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Cannot request completion for a job with status '${jobData.status as string}'. Job must be in_progress.` },
        { status: 400 }
      )
    }

    // ── Authorise — only the assigned worker may request completion ───────────
    if (jobData.assignedWorkerId !== requestedBy) {
      return NextResponse.json(
        { error: 'Only the assigned worker can request job completion' },
        { status: 403 }
      )
    }

    const requestedAt = new Date().toISOString()
    // Admin is notified if homeowner doesn't respond within 48 hours
    const adminNotifyAfter = new Date(Date.now() + FORTY_EIGHT_HOURS_MS).toISOString()

    // ── Record the request on the job document ────────────────────────────────
    await adminDb.collection('jobs').doc(jobId).update({
      completionRequestedAt: requestedAt,
      completionRequestedBy: requestedBy,
      adminNotifyAfter,
      updatedAt: requestedAt,
    })

    const employerId = jobData.employerId as string
    const jobTitle = jobData.title as string

    // ── Look up names / emails ────────────────────────────────────────────────
    const [workerSnap, employerSnap] = await Promise.all([
      adminDb.collection('users').doc(requestedBy).get(),
      adminDb.collection('users').doc(employerId).get(),
    ])

    const workerName = (workerSnap.data()?.displayName as string | undefined) ?? 'Your worker'
    const homeownerEmail = employerSnap.data()?.email as string | undefined
    const homeownerName = (employerSnap.data()?.displayName as string | undefined) ?? 'Homeowner'

    // ── In-app notification to homeowner ──────────────────────────────────────
    await sendNotification({
      userId: employerId,
      type: 'job_status_change',
      title: 'Payment Release Requested 💰',
      message: `${workerName} has requested you confirm "${jobTitle}" is complete so their payment can be released.`,
      metadata: { jobId, requestedAt },
      actionUrl: `/jobs/${jobId}`,
    })

    // ── Email to homeowner (non-blocking) ─────────────────────────────────────
    if (homeownerEmail) {
      void sendPaymentReleaseRequestEmail({
        homeownerEmail,
        homeownerName,
        workerName,
        jobTitle,
        jobId,
      }).catch((err) => {
        console.error('Failed to send payment release request email:', err)
      })
    }

    return NextResponse.json({
      success: true,
      jobId,
      requestedAt,
      adminNotifyAfter,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`POST /api/jobs/${jobId}/request-completion error:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
