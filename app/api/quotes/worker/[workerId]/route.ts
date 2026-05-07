import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/quotes/worker/[workerId]
 * List all quotes submitted by a worker.
 * Query params: status, stats=true
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
    const status = searchParams.get('status') as 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered' | null
    const statsOnly = searchParams.get('stats') === 'true'

    const { getWorkerQuotes } = await import('@/lib/services/quoteService')
    const allQuotes = await getWorkerQuotes(params.workerId)
    const quotes = status ? allQuotes.filter((q) => q.status === status) : allQuotes

    // Calculate acceptance rate
    const total = allQuotes.length
    const accepted = allQuotes.filter((q) => q.status === 'accepted').length
    const rejected = allQuotes.filter((q) => q.status === 'rejected').length
    const pending = allQuotes.filter((q) => q.status === 'pending' || q.status === 'countered').length
    const expired = allQuotes.filter((q) => q.status === 'expired').length
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0

    // This month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const thisMonthCount = allQuotes.filter((q) => q.createdAt >= monthStart).length

    // Average accepted value
    const acceptedQuotes = allQuotes.filter((q) => q.status === 'accepted')
    const averageAcceptedValue =
      acceptedQuotes.length > 0
        ? Math.round(acceptedQuotes.reduce((s, q) => s + q.totalPrice, 0) / acceptedQuotes.length)
        : 0

    // Average response time (createdAt → acceptedAt)
    const responseTimes = acceptedQuotes
      .filter((q) => q.acceptedAt)
      .map((q) => new Date(q.acceptedAt!).getTime() - new Date(q.createdAt).getTime())
    const avgResponseTimeHours =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 3600000)
        : null

    const stats = {
      total,
      accepted,
      rejected,
      pending,
      expired,
      acceptanceRate,
      thisMonthCount,
      averageAcceptedValue,
      avgResponseTimeHours,
    }

    if (statsOnly) {
      return NextResponse.json({ stats })
    }

    return NextResponse.json({ quotes, total: quotes.length, acceptanceRate, stats })
  } catch (err) {
    console.error('GET /api/quotes/worker/[workerId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
