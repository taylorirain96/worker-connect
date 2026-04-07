import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * POST /api/disputes/create
 * Files a new dispute for a job payment.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      jobId?: string
      workerId?: string
      clientId?: string
      reason?: string
      description?: string
      filedBy?: string
      paymentId?: string
      amount?: number
      evidence?: string[]
    }

    const { jobId, workerId, clientId, reason, description, filedBy, paymentId, amount, evidence } = body

    if (!jobId || !workerId || !clientId || !reason || !description || !filedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, workerId, clientId, reason, description, filedBy' },
        { status: 400 }
      )
    }

    // In production: write to Firestore and optionally open a Stripe dispute review
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const docRef = await adminDb.collection('disputes').add({
    //   jobId, workerId, clientId, reason, description, filedBy, paymentId,
    //   amount, evidence: evidence ?? [],
    //   status: 'open',
    //   createdAt: FieldValue.serverTimestamp(),
    //   dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 86400000)),
    // })

    const disputeId = `dispute_${Date.now()}`
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString()

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
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/disputes/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
