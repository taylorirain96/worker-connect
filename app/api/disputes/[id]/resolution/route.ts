import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    // In production, fetch resolution for this dispute from Firestore
    return NextResponse.json({ resolution: null, disputeId: id })
  } catch (error) {
    console.error('GET /api/disputes/[id]/resolution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    const body = await request.json()
    const { decision, refundAmount, mediatorId, mediatorName, reasoning } = body

    if (!decision || !mediatorId || !reasoning) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validDecisions = ['approved', 'denied', 'partial_refund', 'escalated']
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
    }

    // In production:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // await adminDb.collection('disputeResolutions').add({ disputeId: id, ...body, timestamp: FieldValue.serverTimestamp() })
    // Determine new dispute status and update dispute doc...

    const mockResolution = {
      id: `res_${Date.now()}`,
      disputeId: id,
      decision,
      refundAmount: refundAmount ?? 0,
      mediatorId,
      mediatorName: mediatorName ?? 'Mediator',
      reasoning,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ resolution: mockResolution }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes/[id]/resolution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
