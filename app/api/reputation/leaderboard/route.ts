import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/services/reputationService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  try {
    const entries = await getLeaderboard(limit)
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
