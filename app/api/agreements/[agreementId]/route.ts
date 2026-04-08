import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAgreement } from '@/lib/services/agreementService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { agreementId: string } }
) {
  try {
    const agreement = await getAgreement(params.agreementId)
    if (!agreement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ agreement })
  } catch (error) {
    console.error('GET /api/agreements/[agreementId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
