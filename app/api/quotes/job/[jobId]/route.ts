import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/quotes/job/[jobId]
 * List all quotes for a job (employer only).
 * Query params: status, sortBy (price|date), order (asc|desc)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as 'pending' | 'accepted' | 'rejected' | 'expired' | null
    const sortBy = searchParams.get('sortBy') ?? 'date'
    const order = searchParams.get('order') ?? 'desc'

    const { getJobQuotes } = await import('@/lib/services/quoteService')
    let quotes = await getJobQuotes(params.jobId)

    if (status) {
      quotes = quotes.filter((q) => q.status === status)
    }

    // Sort
    quotes.sort((a, b) => {
      let diff = 0
      if (sortBy === 'price') {
        diff = a.totalPrice - b.totalPrice
      } else {
        diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return order === 'asc' ? diff : -diff
    })

    return NextResponse.json({ quotes, total: quotes.length })
  } catch (err) {
    console.error('GET /api/quotes/job/[jobId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
