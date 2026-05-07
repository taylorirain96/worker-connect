/**
 * POST /api/payments/escrow/release
 *
 * Captures the held PaymentIntent, deducts the platform commission, and
 * marks the escrow as released. If the worker has a Stripe Connect account
 * the remainder is transferred; otherwise it is marked as pending payout.
 *
 * Body: { escrowId, releasedBy }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isStripeConfigured, toCents } from '@/lib/stripe'
import { getEscrowById, updateEscrowStatus } from '@/lib/services/escrowService'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'
import { sendPaymentReleasedEmail } from '@/lib/email/transactional'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json() as {
      escrowId?: string
      releasedBy?: string
    }

    const { escrowId, releasedBy } = body

    if (!escrowId || !releasedBy) {
      return NextResponse.json({ error: 'Missing required fields: escrowId, releasedBy' }, { status: 400 })
    }

    const escrow = await getEscrowById(escrowId)
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow record not found' }, { status: 404 })
    }

    if (escrow.status !== 'held') {
      return NextResponse.json(
        { error: `Cannot release escrow with status '${escrow.status}'. Must be 'held'.` },
        { status: 400 }
      )
    }

    // Only employer or admin can release
    if (releasedBy !== escrow.employerId) {
      // Check if admin — look up in Firestore
      let isAdmin = false
      if (adminDb) {
        const userSnap = await adminDb.collection('users').doc(releasedBy).get()
        isAdmin = userSnap.data()?.role === 'admin'
      }
      if (!isAdmin) {
        return NextResponse.json({ error: 'Only the employer or an admin can release escrow' }, { status: 403 })
      }
    }

    const releasedAt = new Date().toISOString()
    let stripeTransferId: string | undefined

    if (isStripeConfigured() && escrow.stripePaymentIntentId && !escrow.stripePaymentIntentId.startsWith('pi_mock_')) {
      // Real Stripe flow: capture the held funds then transfer to worker
      const stripe = getStripe()

      // Capture the held funds
      await stripe.paymentIntents.capture(escrow.stripePaymentIntentId)

      // Attempt worker transfer if they have a Stripe Connect account
      let workerStripeAccountId: string | undefined
      if (adminDb) {
        const workerSnap = await adminDb.collection('users').doc(escrow.workerId).get()
        workerStripeAccountId = workerSnap.data()?.stripeAccountId as string | undefined
      }

      if (workerStripeAccountId) {
        const transfer = await stripe.transfers.create({
          amount: toCents(escrow.workerAmount),
          currency: 'nzd',
          destination: workerStripeAccountId,
          transfer_group: escrow.jobId,
          metadata: {
            escrowId,
            jobId: escrow.jobId,
            workerId: escrow.workerId,
          },
        })
        stripeTransferId = transfer.id
      }
    }

    // Update escrow record
    await updateEscrowStatus(escrowId, 'released', {
      releasedAt,
      stripeTransferId,
    })

    // Update job status in Firestore
    if (adminDb) {
      await adminDb.collection('jobs').doc(escrow.jobId).update({
        escrowStatus: 'released',
        status: 'completed',
        completedAt: releasedAt,
        updatedAt: releasedAt,
      })
    }

    // Notify worker
    await sendNotification({
      userId: escrow.workerId,
      type: 'payment_received',
      title: 'Payment Released! 🎉',
      message: `You've received NZ$${escrow.workerAmount.toFixed(2)} for job #${escrow.jobId}. QuickTrade fee (${(escrow.commissionRate * 100).toFixed(0)}%): NZ$${escrow.commissionAmount.toFixed(2)}.`,
      metadata: {
        escrowId,
        jobId: escrow.jobId,
        amount: escrow.workerAmount,
      },
    })

    // Send "Payment Released" email to worker (non-fatal)
    try {
      let workerEmail: string | undefined
      let workerName: string | undefined
      let jobTitle: string | undefined
      if (adminDb) {
        const [workerSnap, jobSnap] = await Promise.all([
          adminDb.collection('users').doc(escrow.workerId).get(),
          adminDb.collection('jobs').doc(escrow.jobId).get(),
        ])
        if (!workerSnap.exists) {
          console.warn(`Payment-released email: worker document not found for id ${escrow.workerId}`)
        } else {
          const workerData = workerSnap.data()
          workerEmail = workerData?.email as string | undefined
          workerName = (workerData?.displayName ?? workerData?.name) as string | undefined
        }
        if (!jobSnap.exists) {
          console.warn(`Payment-released email: job document not found for id ${escrow.jobId}`)
        } else {
          jobTitle = jobSnap.data()?.title as string | undefined
        }
      }
      if (workerEmail) {
        await sendPaymentReleasedEmail({
          workerEmail,
          workerName: workerName ?? 'there',
          jobTitle: jobTitle ?? `Job #${escrow.jobId.slice(-6)}`,
          grossAmount: escrow.amount,
          commissionAmount: escrow.commissionAmount,
          workerAmount: escrow.workerAmount,
          jobId: escrow.jobId,
        })
      }
    } catch (emailErr) {
      console.error('Failed to send payment-released email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      escrowId,
      jobId: escrow.jobId,
      grossAmount: escrow.amount,
      commissionRate: escrow.commissionRate,
      commissionAmount: escrow.commissionAmount,
      workerAmount: escrow.workerAmount,
      stripeTransferId,
      releasedAt,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error releasing escrow:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
