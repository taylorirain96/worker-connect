import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAgreement } from '@/lib/services/agreementService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const agreement = await getAgreement(params.id)
    if (!agreement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ agreement })
  } catch (error) {
    console.error('GET /api/agreements/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}