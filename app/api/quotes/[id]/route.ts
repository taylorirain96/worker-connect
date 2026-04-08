import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/quotes/[id]    — Fetch single quote
 * PUT /api/quotes/[id]    — Update quote status (accept/reject)
 * DELETE /api/quotes/[id] — Delete quote
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getQuote } = await import('@/lib/services/quoteService')
    const quote = await getQuote(params.id)
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    return NextResponse.json(quote)
  } catch (err) {
    console.error('GET /api/quotes/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { status?: string }
    const { status } = body

    if (!status || !['accepted', 'rejected', 'expired'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be one of: accepted, rejected, expired' },
        { status: 400 }
      )
    }

    const { updateQuoteStatus, getQuote } = await import('@/lib/services/quoteService')
    const quote = await getQuote(params.id)
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    await updateQuoteStatus(params.id, status as 'accepted' | 'rejected' | 'expired')

    // If accepted, auto-create invoice
    if (status === 'accepted') {
      try {
        const { createFullInvoice } = await import('@/lib/services/paymentService')
        await createFullInvoice({
          jobId: quote.jobId,
          jobTitle: quote.jobTitle,
          employerId: quote.employerId,
          workerId: quote.workerId,
          workerName: quote.workerName,
          amount: quote.totalPrice,
          items: [{ description: quote.description, quantity: 1, unitPrice: quote.totalPrice }],
          subtotal: quote.totalPrice,
          tax: quote.tax ?? 0,
          total: quote.totalPrice + (quote.tax ?? 0),
          status: 'draft',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      } catch (invoiceErr) {
        console.error('Failed to auto-create invoice:', invoiceErr)
        // Non-fatal — quote was still accepted
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/quotes/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deleteQuote } = await import('@/lib/services/quoteService')
    await deleteQuote(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    const status = msg.includes('not found') ? 404 : msg.includes('Only expired') ? 400 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
