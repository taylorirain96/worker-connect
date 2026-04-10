import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/quotes/worker/[workerId]
 * List all quotes submitted by a worker.
 * Query params: status
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
    const status = searchParams.get('status') as 'pending' | 'accepted' | 'rejected' | 'expired' | null

    const { getWorkerQuotes } = await import('@/lib/services/quoteService')
    const quotes = await getWorkerQuotes(params.workerId, status ?? undefined)

    // Calculate acceptance rate
    const total = quotes.length
    const accepted = quotes.filter((q) => q.status === 'accepted').length
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0

    return NextResponse.json({ quotes, total, acceptanceRate })
  } catch (err) {
    console.error('GET /api/quotes/worker/[workerId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
