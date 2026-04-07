import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET  /api/invoices/[id]          — fetch a single invoice
 * PATCH /api/invoices/[id]         — update invoice status (send, mark paid, etc.)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
    }

    // In production: fetch from Firestore via paymentService.getInvoice(id)
    const mockInvoice = {
      id,
      jobId: 'job_1',
      jobTitle: 'Plumbing Repair — Kitchen Sink',
      employerId: 'emp_1',
      workerId: 'worker_1',
      workerName: 'Alex Johnson',
      amount: 320,
      tax: 25.6,
      total: 345.6,
      status: 'paid',
      dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      paidAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    }

    return NextResponse.json({ invoice: mockInvoice })
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json() as { status?: string }
    const { status } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
    }

    const validStatuses = ['draft', 'sent', 'paid', 'overdue']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // In production: update in Firestore via paymentService
    // if (status === 'paid') await markInvoicePaid(id)
    // else await updateDoc(doc(db, 'invoices', id), { status })

    return NextResponse.json({ id, status: status ?? 'sent', updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('PATCH /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
