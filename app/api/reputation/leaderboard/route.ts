export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getReputationLeaderboard } from '@/lib/services/reputationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const topN = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100)

    const leaderboard = await getReputationLeaderboard(topN)

    return NextResponse.json({ leaderboard, count: leaderboard.length })
  } catch (error) {
    console.error('Get reputation leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
