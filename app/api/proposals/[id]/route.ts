import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rejectProposal } from '@/lib/services/proposalService'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    await rejectProposal(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/proposals/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
