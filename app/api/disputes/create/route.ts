import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CreateDisputeRequest } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * POST /api/disputes/create
 * Creates a payment dispute / chargeback record.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreateDisputeRequest>
    const { paymentId, jobId, workerId, employerId, amount, currency = 'usd', reason, description, evidence } = body

    if (!paymentId || !jobId || !workerId || !employerId || !amount || !reason || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, jobId, workerId, employerId, amount, reason, description' },
        { status: 400 }
      )
    }

    const now = new Date()
    // Disputes must typically be responded to within 7 days
    const dueBy = new Date(now.getTime() + 7 * 86_400_000).toISOString()

    // In production: create Stripe dispute counter or log internally
    // Also write to Firestore disputes collection

    const dispute = {
      id: `dispute_${Date.now()}`,
      paymentId,
      jobId,
      workerId,
      employerId,
      amount,
      currency,
      reason,
      status: 'needs_response' as const,
      description,
      evidence: evidence ?? '',
      dueBy,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    return NextResponse.json({ dispute }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
