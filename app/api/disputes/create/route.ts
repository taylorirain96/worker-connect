import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendAdminNotification } from '@/lib/notifications/admin'
import { adminDb } from '@/lib/firebase-admin'

/**
 * POST /api/disputes/create
 * Files a new dispute for a job payment.
 * Notifies both the filer and the other party via push notification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      jobId?: string
      jobTitle?: string
      workerId?: string
      clientId?: string
      reason?: string
      description?: string
      filedBy?: string
      paymentId?: string
      amount?: number
      evidence?: string[]
    }

    const { jobId, jobTitle, workerId, clientId, reason, description, filedBy, paymentId, amount, evidence } = body

    if (!jobId || !workerId || !clientId || !reason || !description || !filedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, workerId, clientId, reason, description, filedBy' },
        { status: 400 }
      )
    }

    const disputeId = `dispute_${Date.now()}`
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString()
    const createdAt = new Date().toISOString()

    // Persist to Firestore when available
    if (adminDb) {
      adminDb.collection('disputes').doc(disputeId).set({
        jobId,
        jobTitle: jobTitle ?? null,
        workerId,
        clientId,
        reason,
        description,
        filedBy,
        paymentId: paymentId ?? null,
        amount: amount ?? null,
        evidence: evidence ?? [],
        status: 'open',
        dueDate,
        createdAt,
      }).catch((err: unknown) => console.error('[disputes/create] Failed to save to Firestore:', err))
    }

    const displayTitle = jobTitle ?? jobId
    const otherPartyId = filedBy === workerId ? clientId : workerId

    // Notify the other party about the dispute (non-blocking)
    sendAdminNotification({
      userId: otherPartyId,
      title: 'A dispute has been raised 🚨',
      body: `A dispute has been raised on job "${displayTitle}". Our team will review it within 7 days.`,
      type: 'dispute_opened',
      link: `/jobs/${jobId}`,
    }).catch((err: unknown) => console.warn('[disputes/create] Failed to notify other party:', err))

    // Confirm receipt to the filer
    sendAdminNotification({
      userId: filedBy,
      title: 'Dispute submitted',
      body: `Your dispute for job "${displayTitle}" has been received. We'll review it within 7 days.`,
      type: 'dispute_opened',
      link: `/jobs/${jobId}`,
    }).catch((err: unknown) => console.warn('[disputes/create] Failed to notify filer:', err))

    return NextResponse.json(
      {
        id: disputeId,
        jobId,
        workerId,
        clientId,
        reason,
        description,
        filedBy,
        paymentId: paymentId ?? null,
        amount: amount ?? null,
        evidence: evidence ?? [],
        status: 'open',
        dueDate,
        createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/disputes/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
