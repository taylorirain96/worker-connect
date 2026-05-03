/**
 * POST /api/escrow/auto-release
 *
 * Cron-safe endpoint that scans for completed jobs whose 24-hour worker
 * dispute window has expired without a dispute being raised and ensures
 * their escrow is marked as released.
 *
 * This route is designed to be called by a cron job (e.g. Vercel Cron) once
 * per hour. It is idempotent — jobs that are already released are skipped.
 *
 * No request body is required. Optionally pass a secret in the
 * `Authorization: Bearer <CRON_SECRET>` header to protect the endpoint.
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'

export const dynamic = 'force-dynamic'

interface JobDoc {
  status: string
  workerDisputeDeadline?: string
  assignedWorkerId?: string
  employerId?: string
  title?: string
  escrowStatus?: string
}

export async function POST(request: NextRequest) {
  // Optional cron-secret check
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  const now = new Date()
  const results: Array<{ jobId: string; status: 'auto_released' | 'already_released' | 'error'; message?: string }> = []

  try {
    // Find all completed jobs whose worker dispute window has passed
    // and whose escrow has not yet been released
    const jobsSnap = await adminDb
      .collection('jobs')
      .where('status', '==', 'completed')
      .get()

    for (const jobDoc of jobsSnap.docs) {
      const jobId = jobDoc.id
      const job = jobDoc.data() as JobDoc

      // Skip if no dispute deadline set
      if (!job.workerDisputeDeadline) continue

      const deadline = new Date(job.workerDisputeDeadline)

      // Skip if the 24-hour window has not yet expired
      if (now < deadline) continue

      // Skip if escrow is already released
      if (job.escrowStatus === 'released') {
        results.push({ jobId, status: 'already_released' })
        continue
      }

      try {
        // Find the escrow record for this job in the 'escrows' collection
        const escrowSnap = await adminDb
          .collection('escrows')
          .where('jobId', '==', jobId)
          .limit(1)
          .get()

        const releasedAt = now.toISOString()

        if (!escrowSnap.empty) {
          const escrowDoc = escrowSnap.docs[0]
          const escrow = escrowDoc.data()

          // Only release if it hasn't been released or disputed
          const isReleasable =
            escrow.status === 'pending_deposit' ||
            escrow.status === 'in_escrow' ||
            escrow.status === 'held' ||
            escrow.status === 'pending'

          if (isReleasable) {
            await escrowDoc.ref.update({
              status: 'released',
              releasedAt,
              autoReleased: true,
              updatedAt: releasedAt,
            })
          }
        }

        // Mark the job as escrow-released
        await adminDb.collection('jobs').doc(jobId).update({
          escrowStatus: 'released',
          autoReleasedAt: releasedAt,
          updatedAt: releasedAt,
        })

        // Notify the worker
        if (job.assignedWorkerId) {
          await sendNotification({
            userId: job.assignedWorkerId,
            type: 'payment_received',
            title: 'Payment Auto-Released 💰',
            message: `Payment for "${job.title ?? `Job #${jobId.slice(-6)}`}" has been automatically released as the dispute window has closed.`,
            metadata: { jobId, releasedAt, autoReleased: true },
            actionUrl: `/jobs/${jobId}`,
          })
        }

        results.push({ jobId, status: 'auto_released' })
      } catch (jobErr) {
        const message = jobErr instanceof Error ? jobErr.message : 'Unknown error'
        console.error(`Auto-release failed for job ${jobId}:`, message)
        results.push({ jobId, status: 'error', message })
      }
    }

    const released = results.filter((r) => r.status === 'auto_released').length
    const errors = results.filter((r) => r.status === 'error').length

    return NextResponse.json({
      success: true,
      processed: results.length,
      released,
      errors,
      results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/escrow/auto-release error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
