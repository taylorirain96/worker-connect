export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getReputationScore, getTrustBadges } from '@/lib/services/reputationService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const [score, trust] = await Promise.all([
      getReputationScore(userId),
      getTrustBadges(userId),
    ])

    if (!score) {
      return NextResponse.json(
        { error: 'Reputation data not found for this worker' },
        { status: 404 }
      )
    }

    return NextResponse.json({ score, trust })
  } catch (error) {
    console.error('Get reputation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
