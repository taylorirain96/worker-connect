import { NextResponse } from 'next/server'
import { getMoverLeaderboard } from '@/lib/services/moverService'

export async function GET() {
  try {
    const leaderboard = await getMoverLeaderboard(20)

    const totalWorkers = leaderboard.length
    const avgSuccessRate =
      totalWorkers > 0
        ? Math.round(
            leaderboard.reduce((sum, e) => sum + e.relocationSuccessRate, 0) / totalWorkers
          )
        : 0

    return NextResponse.json({ leaderboard, stats: { totalWorkers, avgSuccessRate } })
  } catch (err) {
    console.error('[analytics/mover-stats]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
