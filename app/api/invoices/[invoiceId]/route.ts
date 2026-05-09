import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'cancelled', 'overdue'],
  paid: ['completed'],
  overdue: ['paid', 'cancelled'],
  completed: [],
  cancelled: [],
}

/**
 * GET  /api/invoices/[invoiceId]   — fetch a single invoice
 * PUT  /api/invoices/[invoiceId]   — update invoice (status transitions, etc.)
 * PATCH /api/invoices/[invoiceId]  — alias for PUT (legacy support)
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  const params = await context.params
  try {
    const { invoiceId } = params

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
    }

    const snap = await adminDb.collection('invoices').doc(invoiceId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const data = snap.data() as Record<string, unknown>
    return NextResponse.json({
      invoice: {
        id: snap.id,
        ...data,
        createdAt: toIso(data.createdAt),
        updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
        paidAt: data.paidAt ? toIso(data.paidAt) : undefined,
      },
    })
  } catch (error) {
    console.error('GET /api/invoices/[invoiceId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleUpdate(
  req: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  const params = await context.params
  try {
    const { invoiceId } = params
    const body = await req.json() as { status?: string; [key: string]: unknown }
    const { status, ...rest } = body

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { ...rest, updatedAt: FieldValue.serverTimestamp() }

    if (status !== undefined) {
      // Validate status transition
      const snap = await adminDb.collection('invoices').doc(invoiceId).get()
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

      updates.status = status
      if (status === 'paid') updates.paidAt = new Date().toISOString()
    }

    await adminDb.collection('invoices').doc(invoiceId).update(updates)
    console.log(`Invoice ${invoiceId} updated: status=${status ?? 'no change'}`)

    return NextResponse.json({ id: invoiceId, status: status ?? 'unchanged', updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('PUT /api/invoices/[invoiceId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export { handleUpdate as PUT, handleUpdate as PATCH }
