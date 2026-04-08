import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { acceptProposal } from '@/lib/services/proposalService'

export const dynamic = 'force-dynamic'

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await acceptProposal(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/proposals/[id]/accept error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
