import { NextRequest, NextResponse } from 'next/server'
import { getTrustBadges } from '@/lib/services/reputationService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await getTrustBadges(params.userId)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[trust-badges/[userId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
