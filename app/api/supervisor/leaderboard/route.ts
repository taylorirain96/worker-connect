import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupervisorLeaderboard } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const leaderboard = await getSupervisorLeaderboard()
    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('GET /api/supervisor/leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
