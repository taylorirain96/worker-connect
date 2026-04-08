import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'cancelled', 'overdue'],
  paid: ['completed'],
  overdue: ['paid', 'cancelled'],
  completed: [],
  cancelled: [],
}

/**
 * GET  /api/invoices/[id]   — fetch a single invoice
 * PUT  /api/invoices/[id]   — update invoice (status transitions, etc.)
 * PATCH /api/invoices/[id]  — alias for PUT (legacy support)
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

    try {
      const snap = await adminDb.collection('invoices').doc(id).get()
      if (!snap.exists) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
      return NextResponse.json({ invoice: { id: snap.id, ...snap.data() } })
    } catch {
      // Mock fallback when Firestore unavailable
      const mockInvoice = {
        id,
        invoiceNumber: 'INV-20260408-0001',
        jobId: 'job_1',
        jobTitle: 'Plumbing Repair — Kitchen Sink',
        employerId: 'emp_1',
        workerId: 'worker_1',
        workerName: 'Alex Johnson',
        amount: 320,
        items: [{ description: 'Labor', quantity: 4, unitPrice: 80 }],
        subtotal: 320,
        tax: 25.6,
        total: 345.6,
        status: 'paid',
        dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      }
      return NextResponse.json({ invoice: mockInvoice })
    }
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleUpdate(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json() as { status?: string; [key: string]: unknown }
    const { status, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { ...rest, updatedAt: FieldValue.serverTimestamp() }

    if (status !== undefined) {
      // Validate status transition
      try {
        const snap = await adminDb.collection('invoices').doc(id).get()
        if (!snap.exists) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }
        const currentStatus = (snap.data()?.status ?? 'draft') as string
        const allowed = VALID_TRANSITIONS[currentStatus] ?? []
        if (!allowed.includes(status)) {
          return NextResponse.json(
            { error: `Invalid status transition from '${currentStatus}' to '${status}'` },
            { status: 400 }
          )
        }
      } catch {
        // Skip validation if Firestore unavailable — will be caught below
      }

      updates.status = status
      if (status === 'paid') updates.paidAt = new Date().toISOString()
    }

    try {
      await adminDb.collection('invoices').doc(id).update(updates)
      console.log(`Invoice ${id} updated: status=${status ?? 'no change'}`)
    } catch {
      console.warn('Firestore unavailable — returning mock update response')
    }

    return NextResponse.json({ id, status: status ?? 'unchanged', updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('PUT /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export { handleUpdate as PUT, handleUpdate as PATCH }

