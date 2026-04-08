import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/services/reputationService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') ?? '10', 10)
    const limit = Math.min(50, Math.max(1, isNaN(limitParam) ? 10 : limitParam))
    const leaderboard = await getLeaderboard(limit)
    return NextResponse.json({ leaderboard, count: leaderboard.length })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
