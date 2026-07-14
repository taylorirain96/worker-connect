/**
 * POST /api/jobs/[jobId]/complete
 *
 * Marks a job as completed, releases the escrow payment to the worker,
 * and sends an in-app notification.
 *
 * Body: { completedBy: string }   — UID of the employer marking it complete
 *
 * Idempotent: returns success if the job is already completed.
 * Returns 207 Multi-Status if the job was marked complete but escrow release
 * failed (so the client can surface an error about the payment step).
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'
import { getStripe, isStripeConfigured, toCents } from '@/lib/stripe'
import {
  sendJobCompletedWorkerEmail,
  sendJobCompletedHomeownerEmail,
} from '@/lib/email/transactional'
import { sendSMS as sendTwilioSMS } from '@/lib/sms'
import { buildSMSMessage } from '@/lib/notifications/sms'
import { getCurrencyDisplay } from '@/lib/services/escrowService'
import { checkAndAwardAchievements } from '@/lib/services/achievementService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  const { jobId } = params

  try {
    const body = await request.json() as { completedBy?: string }
    const { completedBy } = body

    if (!completedBy) {
      return NextResponse.json(
        { error: 'Missing required field: completedBy' },
        { status: 400 }
      )
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    // ── Fetch job ────────────────────────────────────────────────────────────
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const jobData = jobSnap.data()!

    // ── Idempotency check ────────────────────────────────────────────────────
    if (jobData.status === 'completed') {
      return NextResponse.json({
        success: true,
        jobId,
        status: 'completed',
        completedAt: jobData.completedAt ?? new Date().toISOString(),
        alreadyCompleted: true,
      })
    }

    // ── Validate job state ───────────────────────────────────────────────────
    if (jobData.status !== 'in_progress') {
      return NextResponse.json(
        {
          error: `Cannot complete a job with status '${jobData.status as string}'. Job must be in_progress.`,
        },
        { status: 400 }
      )
    }

    // ── Authorise — only the employer may mark complete ──────────────────────
    if (jobData.employerId !== completedBy) {
      return NextResponse.json(
        { error: 'Only the employer can mark this job as complete' },
        { status: 403 }
      )
    }

    const completedAt = new Date().toISOString()
    // Workers have 24 hours to dispute the completion
    const workerDisputeDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // ── Update job status ────────────────────────────────────────────────────
    await adminDb.collection('jobs').doc(jobId).update({
      status: 'completed',
      workflowStage: 'completed',
      completedAt,
      workerDisputeDeadline,
      updatedAt: completedAt,
    })

    // ── Find & release escrow ────────────────────────────────────────────────
    const escrowSnap = await adminDb
      .collection('escrows')
      .where('jobId', '==', jobId)
      .limit(1)
      .get()

    let escrowReleased = false
    let workerAmount: number | undefined
    let commissionAmount: number | undefined
    let commissionRate: number | undefined
    let stripeTransferId: string | undefined
    let paymentCurrencyLabel: 'NZ$' | 'A$' = getCurrencyDisplay(undefined).label
    const assignedWorkerId: string = jobData.assignedWorkerId as string ?? ''

    if (!escrowSnap.empty) {
      const escrowDoc = escrowSnap.docs[0]
      const escrow = escrowDoc.data()
      const escrowWorkerId = escrow.workerId as string

      const isReleasable =
        escrow.status === 'pending_deposit' ||
        escrow.status === 'in_escrow' ||
        escrow.status === 'held'

      if (isReleasable) {
        workerAmount = (escrow.workerReceives ?? escrow.workerAmount ?? escrow.amount) as number
        commissionAmount = (escrow.commission ?? escrow.commissionAmount ?? 0) as number
        commissionRate = (escrow.commissionRate ?? 0) as number
        const { code: payoutCurrencyCode, label: paymentLabel } = getCurrencyDisplay(escrow.currency as string | undefined)
        paymentCurrencyLabel = paymentLabel

        // Real Stripe flow when keys are configured and PI is not a mock
        if (
          isStripeConfigured() &&
          escrow.stripePaymentIntentId &&
          !(escrow.stripePaymentIntentId as string).startsWith('pi_mock_')
        ) {
          try {
            const stripe = getStripe()

            // Capture the held funds
            await stripe.paymentIntents.capture(escrow.stripePaymentIntentId as string)

            // Transfer to the worker's Stripe Connect account if they have one
            const workerSnap = await adminDb.collection('users').doc(escrowWorkerId).get()
            const workerStripeAccountId = workerSnap.data()?.stripeAccountId as string | undefined

            if (workerStripeAccountId) {
              const transfer = await stripe.transfers.create({
                amount: toCents(workerAmount),
                currency: payoutCurrencyCode,
                destination: workerStripeAccountId,
                transfer_group: jobId,
                metadata: {
                  escrowId: escrowDoc.id,
                  jobId,
                  workerId: escrowWorkerId,
                  releasedBy: completedBy,
                  releaseTrigger: 'homeowner_signoff',
                },
              })
              stripeTransferId = transfer.id
            }
          } catch (stripeErr) {
            // Job is already marked complete — surface a partial-success response
            console.error('Stripe escrow release failed (job still marked complete):', stripeErr)
            const stripeMessage =
              stripeErr instanceof Error ? stripeErr.message : 'Stripe error'
            return NextResponse.json(
              {
                error: `Job marked complete but escrow release failed: ${stripeMessage}. Please contact support.`,
                jobId,
                status: 'completed',
                completedAt,
                escrowReleased: false,
              },
              { status: 207 }
            )
          }
        }

        // Mark escrow as released
        await escrowDoc.ref.update({
          status: 'released',
          releasedAt: completedAt,
          releasedBy: completedBy,
          releaseAuthorizedAt: completedAt,
          releaseTrigger: 'homeowner_signoff',
          ...(stripeTransferId ? { stripeTransferId } : {}),
          updatedAt: completedAt,
        })

        // Reflect escrow release on the job document too
        await adminDb.collection('jobs').doc(jobId).update({
          escrowStatus: 'released',
          workflowStage: 'funds_released',
        })

        escrowReleased = true
      } else if (escrow.status === 'released') {
        // Already released — treat as success
        escrowReleased = true
        workerAmount = (escrow.workerReceives ?? escrow.workerAmount ?? escrow.amount) as number
        commissionAmount = (escrow.commission ?? escrow.commissionAmount ?? 0) as number
        commissionRate = (escrow.commissionRate ?? 0) as number
        paymentCurrencyLabel = getCurrencyDisplay(escrow.currency as string | undefined).label
      }
    }

    // ── Notify worker ────────────────────────────────────────────────────────
    const workerIdToNotify = assignedWorkerId || (!escrowSnap.empty ? (escrowSnap.docs[0].data().workerId as string) : '')

    if (workerIdToNotify) {
      const paymentMsg =
        escrowReleased && workerAmount !== undefined
          ? ` Your payment of ${paymentCurrencyLabel}${workerAmount.toFixed(2)} has been released.`
          : ''
      await sendNotification({
        userId: workerIdToNotify,
        type: 'payment_received',
        title: 'Job Completed — Payment Released! 🎉',
        message: `The employer has marked job "${jobData.title as string}" as complete.${paymentMsg} You have 24 hours to dispute if needed.`,
        metadata: { jobId, completedAt, ...(workerAmount !== undefined ? { workerAmount } : {}) },
        actionUrl: `/jobs/${jobId}`,
      })

      if (escrowReleased) {
        await checkAndAwardAchievements(workerIdToNotify, jobId)
      }
    }

    // ── Notify homeowner ─────────────────────────────────────────────────────
    await sendNotification({
      userId: completedBy,
      type: 'job_completed',
      title: 'Job Marked as Complete ✓',
      message: `You've marked "${jobData.title as string}" as complete. Payment has been released to the worker.`,
      metadata: { jobId, completedAt },
      actionUrl: `/jobs/${jobId}`,
    })

    // ── Send emails (non-blocking) ───────────────────────────────────────────
    ;(async () => {
      try {
        // Look up worker + employer email addresses
        const [workerSnap, employerSnap] = await Promise.all([
          workerIdToNotify && adminDb ? adminDb.collection('users').doc(workerIdToNotify).get() : Promise.resolve(null),
          adminDb ? adminDb.collection('users').doc(completedBy).get() : Promise.resolve(null),
        ])

        const workerEmail = workerSnap?.data()?.email as string | undefined
        const workerName = (workerSnap?.data()?.displayName as string | undefined) ?? 'Worker'
        const homeownerEmail = employerSnap?.data()?.email as string | undefined
        const homeownerName = (employerSnap?.data()?.displayName as string | undefined) ?? 'Homeowner'
        const jobTitle = jobData.title as string

        if (workerEmail && workerIdToNotify) {
          await sendJobCompletedWorkerEmail({
            workerEmail,
            workerName,
            homeownerName,
            jobTitle,
            jobId,
            paymentAmount: workerAmount ?? 0,
          })
        }

        if (homeownerEmail) {
          await sendJobCompletedHomeownerEmail({
            homeownerEmail,
            homeownerName,
            workerName,
            jobTitle,
            jobId,
          })
        }

        // SMS to worker when payment released (non-blocking)
        if (workerIdToNotify && escrowReleased && workerAmount !== undefined) {
          const workerPhone = workerSnap?.data()?.phone as string | undefined
          if (workerPhone) {
            const smsBody = buildSMSMessage('payment_received', {
              amount: workerAmount,
              jobTitle,
            })
            sendTwilioSMS({ to: workerPhone, body: smsBody }).catch(() => {})
          }
        }
      } catch (emailErr) {
        console.error('Failed to send job completion emails:', emailErr)
      }
    })().catch((err) => {
      console.error('Unhandled error in job completion email task:', err)
    })

    return NextResponse.json({
      success: true,
      jobId,
      status: 'completed',
      completedAt,
      workerDisputeDeadline,
      escrowReleased,
      workerAmount,
      commissionAmount,
      commissionRate,
      stripeTransferId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`POST /api/jobs/${jobId}/complete error:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
