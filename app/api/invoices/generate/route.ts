import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { GenerateInvoiceRequest } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * POST /api/invoices/generate
 * Generates a new invoice with line items, tax, and totals.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<GenerateInvoiceRequest>
    const {
      jobId,
      jobTitle,
      employerId,
      employerName,
      workerId,
      workerName,
      lineItems,
      taxRate = 0.08,
      currency = 'usd',
      dueDate,
      notes,
    } = body

    if (!jobId || !jobTitle || !employerId || !employerName || !workerId || !workerName || !lineItems?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, jobTitle, employerId, employerName, workerId, workerName, lineItems' },
        { status: 400 }
      )
    }

    // Validate line items
    for (const item of lineItems) {
      if (!item.description || item.quantity <= 0 || item.unitPrice < 0) {
        return NextResponse.json({ error: 'Invalid line item: description, positive quantity, and non-negative unitPrice required' }, { status: 400 })
      }
      // Recalculate line item amount to prevent tampering
      item.amount = Math.round(item.quantity * item.unitPrice * 100) / 100
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const tax = Math.round(subtotal * taxRate * 100) / 100
    const total = Math.round((subtotal + tax) * 100) / 100

    const now = new Date()
    const uniqueSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${uniqueSuffix}`
    const dueDateValue = dueDate ?? new Date(now.getTime() + 30 * 86_400_000).toISOString()

    const invoiceData = {
      invoiceNumber,
      jobId,
      jobTitle,
      employerId,
      employerName,
      workerId,
      workerName,
      lineItems,
      subtotal,
      taxRate,
      tax,
      total,
      currency,
      status: 'draft' as const,
      dueDate: dueDateValue,
      notes,
      createdAt: now.toISOString(),
    }

    // Persist to Firestore if available
    let invoiceId: string = `inv_${Date.now()}`
    try {
      const { createInvoice } = await import('@/lib/services/paymentService')
      invoiceId = await createInvoice({
        ...invoiceData,
        // Existing Invoice type uses flat fields; pass compatible data
        amount: subtotal,
        tax,
        total,
        status: 'draft',
        dueDate: dueDateValue,
      } as Parameters<typeof createInvoice>[0])
    } catch {
      // Non-fatal: Firestore may not be configured
    }

    return NextResponse.json({ id: invoiceId, ...invoiceData }, { status: 201 })
  } catch (error) {
    console.error('POST /api/invoices/generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
