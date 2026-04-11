/**
 * POST /api/payments/escrow/dispute
 *
 * Freezes escrow funds pending dispute resolution.
 *
 * Body: { escrowId, raisedBy, reason }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getEscrowById, updateEscrowStatus } from '@/lib/services/escrowService'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      escrowId?: string
      raisedBy?: string
      reason?: string
    }

    const { escrowId, raisedBy, reason } = body

    if (!escrowId || !raisedBy || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: escrowId, raisedBy, reason' },
        { status: 400 }
      )
    }

    const escrow = await getEscrowById(escrowId)
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow record not found' }, { status: 404 })
    }

    if (escrow.status !== 'held') {
      return NextResponse.json(
        { error: `Cannot dispute escrow with status '${escrow.status}'. Must be 'held'.` },
        { status: 400 }
      )
    }

    // Only employer or worker can raise a dispute
    if (raisedBy !== escrow.employerId && raisedBy !== escrow.workerId) {
      return NextResponse.json(
        { error: 'Only the employer or worker on this job can raise a dispute' },
        { status: 403 }
      )
    }

    const disputedAt = new Date().toISOString()

    await updateEscrowStatus(escrowId, 'disputed', {
      disputeReason: reason,
      disputedAt,
    })

    // Update job escrow status
    if (adminDb) {
      await adminDb.collection('jobs').doc(escrow.jobId).update({
        escrowStatus: 'disputed',
        updatedAt: disputedAt,
      })

      // Create a dispute record for admin review
      await adminDb.collection('disputes').add({
        type: 'escrow',
        escrowId,
        jobId: escrow.jobId,
        employerId: escrow.employerId,
        workerId: escrow.workerId,
        raisedBy,
        reason,
        amount: escrow.amount,
        currency: escrow.currency,
        status: 'open',
        notes: '',
        createdAt: disputedAt,
        updatedAt: disputedAt,
      })
    }

    // Notify both parties
    const otherPartyId = raisedBy === escrow.employerId ? escrow.workerId : escrow.employerId
    await Promise.all([
      sendNotification({
        userId: raisedBy,
        type: 'dispute_opened',
        title: 'Dispute Raised',
        message: `Your dispute for job #${escrow.jobId} has been submitted. Funds of NZ$${escrow.amount.toFixed(2)} are frozen pending resolution by QuickTrade.`,
        metadata: { escrowId, jobId: escrow.jobId },
      }),
      sendNotification({
        userId: otherPartyId,
        type: 'dispute_opened',
        title: 'Dispute Opened on Your Job',
        message: `A dispute has been raised for job #${escrow.jobId}. Funds of NZ$${escrow.amount.toFixed(2)} are frozen pending QuickTrade review.`,
        metadata: { escrowId, jobId: escrow.jobId },
      }),
    ])

    return NextResponse.json({
      success: true,
      escrowId,
      jobId: escrow.jobId,
      status: 'disputed',
      disputedAt,
      message: 'Escrow funds frozen. QuickTrade will review and resolve the dispute.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error raising escrow dispute:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
