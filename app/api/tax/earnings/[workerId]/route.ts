import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tax/earnings/[workerId]
 * Returns EarningsRecord[] for a worker with optional date range filtering.
 * Query params: from (ISO date), to (ISO date)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ workerId: string }> }
) {
  const params = await context.params
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const { getWorkerEarnings } = await import('@/lib/services/taxService')
    const records = await getWorkerEarnings(
      params.workerId,
      from && to ? { from, to } : undefined
    )

    const totalGross = records.reduce((s, r) => s + r.grossAmount, 0)
    const totalNet = records.reduce((s, r) => s + r.netAmount, 0)
    const totalFees = records.reduce((s, r) => s + r.platformFee, 0)

    return NextResponse.json({
      records,
      totals: {
        gross: Math.round(totalGross * 100) / 100,
        net: Math.round(totalNet * 100) / 100,
        fees: Math.round(totalFees * 100) / 100,
        count: records.length,
      },
    })
  } catch (err) {
    console.error('GET /api/tax/earnings/[workerId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
