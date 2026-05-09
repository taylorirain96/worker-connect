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

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate an invoice number like INV-20260408-0001 */
async function generateInvoiceNumber(): Promise<string> {
  const today = new Date()
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '')
  try {
    // Use a counter document to track sequence per day
    const counterRef = adminDb.collection('invoiceCounters').doc(datePart)
    const counterSnap = await counterRef.get()
    const seq = counterSnap.exists ? (counterSnap.data()?.seq ?? 0) + 1 : 1
    await counterRef.set({ seq, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    return `INV-${datePart}-${String(seq).padStart(4, '0')}`
  } catch {
    // Fallback to timestamp-based number if Firestore unavailable
    return `INV-${datePart}-${String(Date.now()).slice(-4)}`
  }
}

// VALID_TRANSITIONS is defined locally in [id]/route.ts for status updates


/**
 * GET  /api/invoices?workerId=xxx  — list invoices for a worker
 * POST /api/invoices               — create a new invoice
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workerId = searchParams.get('workerId')
    const status = searchParams.get('status')
    const pageSize = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 })
    }

    let q = adminDb
      .collection('invoices')
      .where('workerId', '==', workerId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize)

    if (status) {
      q = adminDb
        .collection('invoices')
        .where('workerId', '==', workerId)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(pageSize)
    }

    const snap = await q.get()
    const invoices = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        id: d.id,
        ...data,
        createdAt: toIso(data.createdAt),
        updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
        paidAt: data.paidAt ? toIso(data.paidAt) : undefined,
      }
    })

    return NextResponse.json({ invoices, total: invoices.length })
  } catch (error) {
    console.error('GET /api/invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      jobId?: string
      jobTitle?: string
      employerId?: string
      workerId?: string
      workerName?: string
      amount?: number
      items?: { description: string; quantity: number; unitPrice: number }[]
      dueDate?: string
      taxRate?: number
    }

    const { jobId, employerId, workerId, dueDate } = body
    const jobTitle = body.jobTitle ?? ''
    const workerName = body.workerName ?? ''
    const taxRate = body.taxRate ?? 0.08
    const items = body.items ?? []

    if (!jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields: jobId, employerId, workerId' }, { status: 400 })
    }

    // Calculate totals from items if provided, otherwise use amount
    let subtotal: number
    if (items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    } else if (typeof body.amount === 'number') {
      subtotal = body.amount
    } else {
      return NextResponse.json({ error: 'Provide either items or amount' }, { status: 400 })
    }

    subtotal = Math.round(subtotal * 100) / 100
    const tax = Math.round(subtotal * taxRate * 100) / 100
    const total = Math.round((subtotal + tax) * 100) / 100

    const invoiceNumber = await generateInvoiceNumber()
    const now = new Date().toISOString()
    const effectiveDueDate = dueDate ?? new Date(Date.now() + 30 * 86400000).toISOString()

    const invoiceData = {
      invoiceNumber,
      jobId,
      jobTitle,
      employerId,
      workerId,
      workerName,
      amount: subtotal,
      items,
      subtotal,
      tax,
      total,
      status: 'draft',
      dueDate: effectiveDueDate,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const ref = await adminDb.collection('invoices').add(invoiceData)
    const invoiceId = ref.id
    console.log(`Invoice created: ${invoiceId} (${invoiceNumber})`)

    return NextResponse.json(
      {
        id: invoiceId,
        invoiceNumber,
        jobId,
        jobTitle,
        employerId,
        workerId,
        workerName,
        amount: subtotal,
        items,
        subtotal,
        tax,
        total,
        status: 'draft',
        dueDate: effectiveDueDate,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
