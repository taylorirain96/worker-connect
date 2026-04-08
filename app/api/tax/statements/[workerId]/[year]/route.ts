import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tax/statements/[workerId]/[year]
 * Returns YearlyEarnings with quarterly breakdown for a worker.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { workerId: string; year: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const year = parseInt(params.year, 10)
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const { getYearlyEarnings } = await import('@/lib/services/taxService')
    const statement = await getYearlyEarnings(params.workerId, year)

    return NextResponse.json(statement)
  } catch (err) {
    console.error('GET /api/tax/statements/[workerId]/[year] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
