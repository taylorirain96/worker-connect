import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { completeAgreement } from '@/lib/services/agreementService'

export const dynamic = 'force-dynamic'

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await completeAgreement(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/agreements/[id]/complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
