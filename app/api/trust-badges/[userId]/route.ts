import { NextRequest, NextResponse } from 'next/server'
import { getTrustBadges } from '@/lib/services/reputationService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const badges = await getTrustBadges(params.userId)
    return NextResponse.json(badges)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trust badges' }, { status: 500 })
  }
}
