/**
 * GET  /api/jobs/[jobId]/payment — get payment & escrow status for a job
 * POST /api/jobs/[jobId]/payment — create/update escrow record for a job
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { EscrowRecord } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params

  try {
    // Fetch payment records for this job
    const paymentsSnap = await adminDb
      .collection('jobPayments')
      .where('jobId', '==', jobId)
      .orderBy('createdAt', 'desc')
      .get()

    const payments = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Fetch escrow record
    const escrowSnap = await adminDb
      .collection('escrows')
      .where('jobId', '==', jobId)
      .limit(1)
      .get()

    const escrow = escrowSnap.empty
      ? null
      : { id: escrowSnap.docs[0].id, ...escrowSnap.docs[0].data() }

    return NextResponse.json({ payments, escrow })
  } catch (err) {
    console.error('GET /api/jobs/[jobId]/payment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params

  try {
    const body = await req.json() as Partial<EscrowRecord> & {
      action?: 'create_escrow' | 'mark_disputed' | 'mark_refunded'
    }

    const { action, ...data } = body

    if (action === 'create_escrow') {
      const now = new Date().toISOString()
      const autoReleaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const escrowData: Omit<EscrowRecord, 'id'> = {
        jobId,
        jobTitle: data.jobTitle ?? '',
        workerId: data.workerId ?? '',
        employerId: data.employerId ?? '',
        amount: data.amount ?? 0,
        commission: data.commission ?? 0,
        commissionRate: data.commissionRate ?? 0.075,
        workerReceives: data.workerReceives ?? 0,
        currency: data.currency ?? 'nzd',
        status: 'pending_deposit',
        workerTier: data.workerTier ?? 'new',
        stripePaymentIntentId: data.stripePaymentIntentId,
        createdAt: now,
        updatedAt: now,
        autoReleaseAt,
      }

      const ref = await adminDb.collection('escrows').add(escrowData)
      return NextResponse.json({ id: ref.id, ...escrowData }, { status: 201 })
    }

    if (action === 'mark_disputed') {
      const escrowSnap = await adminDb
        .collection('escrows')
        .where('jobId', '==', jobId)
        .limit(1)
        .get()

      if (escrowSnap.empty) {
        return NextResponse.json({ error: 'Escrow record not found' }, { status: 404 })
      }

      await escrowSnap.docs[0].ref.update({
        status: 'disputed',
        updatedAt: new Date().toISOString(),
      })

      return NextResponse.json({ success: true, status: 'disputed' })
    }

    if (action === 'mark_refunded') {
      const escrowSnap = await adminDb
        .collection('escrows')
        .where('jobId', '==', jobId)
        .limit(1)
        .get()

      if (escrowSnap.empty) {
        return NextResponse.json({ error: 'Escrow record not found' }, { status: 404 })
      }

      await escrowSnap.docs[0].ref.update({
        status: 'refunded',
        updatedAt: new Date().toISOString(),
      })

      return NextResponse.json({ success: true, status: 'refunded' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('POST /api/jobs/[jobId]/payment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
