/**
 * POST /api/jobs/[jobId]/milestones/[milestoneId]/approve
 *
 * Employer approves (or rejects) a submitted milestone.
 * On approval: releases the milestone's proportional escrow amount to the worker.
 *
 * Body: { action: 'approve' | 'reject'; reviewNote?: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'
import { getStripe, isStripeConfigured, toCents } from '@/lib/stripe'
import type { JobMilestone } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string; milestoneId: string } }
) {
  const { jobId, milestoneId } = params
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

  try {
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    const job = jobSnap.data()!

    // Only the employer may approve/reject milestones
    if (job.employerId !== userId) {
      return NextResponse.json({ error: 'Only the employer can approve milestones' }, { status: 403 })
    }

    const mRef = adminDb.collection('jobs').doc(jobId).collection('milestones').doc(milestoneId)
    const mSnap = await mRef.get()
    if (!mSnap.exists) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })

    const milestone = mSnap.data() as JobMilestone
    if (milestone.status !== 'submitted') {
      return NextResponse.json(
        { error: `Milestone must be in 'submitted' state to review (current: ${milestone.status})` },
        { status: 400 }
      )
    }

    const body = (await req.json()) as { action: 'approve' | 'reject'; reviewNote?: string }
    const { action, reviewNote } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const assignedWorkerId = job.assignedWorkerId as string | undefined

    // ── REJECT ────────────────────────────────────────────────────────────────
    if (action === 'reject') {
      await mRef.update({
        status: 'rejected',
        reviewNote: reviewNote ?? null,
        updatedAt: now,
      })

      if (assignedWorkerId) {
        await sendNotification({
          userId: assignedWorkerId,
          type: 'job_status_change',
          title: 'Milestone Requires Changes',
          message: `"${milestone.title}" was not approved. ${reviewNote ? `Feedback: ${reviewNote}` : 'Please review and resubmit.'}`,
          metadata: { jobId, milestoneId },
          actionUrl: `/dashboard/worker/jobs/${jobId}/milestones`,
        })
      }

      return NextResponse.json({ success: true, milestoneId, status: 'rejected' })
    }

    // ── APPROVE + PARTIAL PAYMENT ──────────────────────────────────────────────
    let stripeTransferId: string | undefined

    if (assignedWorkerId && isStripeConfigured()) {
      try {
        // Look up the worker's Stripe Connect account
        const workerSnap = await adminDb.collection('users').doc(assignedWorkerId).get()
        const workerStripeAccountId = workerSnap.data()?.stripeAccountId as string | undefined

        // Look up the escrow record for this job
        const escrowSnap = await adminDb
          .collection('escrows')
          .where('jobId', '==', jobId)
          .limit(1)
          .get()

        if (workerStripeAccountId && !escrowSnap.empty) {
          const escrow = escrowSnap.docs[0].data()
          const stripePaymentIntentId = escrow.stripePaymentIntentId as string | undefined

          // Only proceed if this is a real (non-mock) payment intent
          if (
            stripePaymentIntentId &&
            !stripePaymentIntentId.startsWith('pi_mock_')
          ) {
            const stripe = getStripe()
            const transferAmountCents = toCents(milestone.amount)

            const transfer = await stripe.transfers.create({
              amount: transferAmountCents,
              currency: (escrow.currency as string | undefined) ?? 'nzd',
              destination: workerStripeAccountId,
              transfer_group: jobId,
              metadata: {
                jobId,
                milestoneId,
                milestoneTitle: milestone.title,
              },
            })
            stripeTransferId = transfer.id
          }
        }
      } catch (stripeErr) {
        // Non-fatal: still mark milestone approved even if Stripe transfer fails
        console.error('[milestone/approve] Stripe transfer error:', stripeErr)
      }
    }

    await mRef.update({
      status: 'approved',
      approvedAt: now,
      reviewNote: reviewNote ?? null,
      ...(stripeTransferId ? { stripeTransferId } : {}),
      updatedAt: now,
    })

    // Notify the worker
    if (assignedWorkerId) {
      const paymentNote = stripeTransferId ? ' Your payment has been transferred.' : ''
      await sendNotification({
        userId: assignedWorkerId,
        type: 'payment_received',
        title: `Milestone Approved — NZ$${milestone.amount.toFixed(2)} Released 🎉`,
        message: `"${milestone.title}" on job "${job.title as string}" was approved.${paymentNote}`,
        metadata: { jobId, milestoneId, amount: milestone.amount },
        actionUrl: `/dashboard/worker/jobs/${jobId}/milestones`,
      })
    }

    return NextResponse.json({
      success: true,
      milestoneId,
      status: 'approved',
      stripeTransferId,
      amount: milestone.amount,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
