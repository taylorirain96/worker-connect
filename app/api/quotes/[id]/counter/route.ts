import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/quotes/[id]/counter
 * Employer sends a counter offer on a pending quote.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      counterOfferPrice?: number
      counterOfferNote?: string
    }

    const { counterOfferPrice, counterOfferNote } = body

    if (counterOfferPrice === undefined || counterOfferPrice <= 0) {
      return NextResponse.json(
        { error: 'counterOfferPrice must be a positive number' },
        { status: 400 }
      )
    }

    const { counterQuote } = await import('@/lib/services/quoteService')
    await counterQuote(id, counterOfferPrice, counterOfferNote)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/quotes/[id]/counter error:', err)
    const msg = err instanceof Error ? err.message : 'Internal server error'
    const status = msg.includes('not found') ? 404 : msg.includes('Only pending') ? 400 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
