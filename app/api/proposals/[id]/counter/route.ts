import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { submitCounterOffer } from '@/lib/services/proposalService'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const body = await request.json()
    const { proposedBy, rate, hours, duration, specialRequests, message } = body
    if (!proposedBy || !rate || !hours || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    await submitCounterOffer(params.id, { proposedBy, rate, hours, duration, specialRequests, message })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/proposals/[id]/counter error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
