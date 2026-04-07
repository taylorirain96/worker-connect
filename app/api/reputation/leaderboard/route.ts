import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/services/reputationService'

export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get('limit')
    const n = limitParam ? parseInt(limitParam, 10) : 10
    const entries = await getLeaderboard(n)
    return NextResponse.json(entries)
  } catch (err) {
    console.error('[reputation/leaderboard]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
