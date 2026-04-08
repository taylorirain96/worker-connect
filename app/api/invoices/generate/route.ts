import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * POST /api/invoices/generate
 * Generates a new invoice for a completed or in-progress job.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      jobId?: string
      jobTitle?: string
      employerId?: string
      workerId?: string
      workerName?: string
      amount?: number
      taxRate?: number
      dueInDays?: number
      lineItems?: Array<{ description: string; quantity: number; unitPrice: number }>
    }

    const {
      jobId,
      jobTitle,
      employerId,
      workerId,
      workerName,
      amount,
      taxRate = 0.08,
      dueInDays = 30,
      lineItems,
    } = body

    if (!jobId || !jobTitle || !employerId || !workerId || !workerName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
    }

    const subtotal = lineItems
      ? lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      : amount

    const tax = Math.round(subtotal * taxRate * 100) / 100
    const total = Math.round((subtotal + tax) * 100) / 100

    // In production: store in Firestore and optionally create a Stripe Invoice
    // const { getStripe } = await import('@/lib/stripe')
    // const stripe = getStripe()
    // const stripeInvoice = await stripe.invoices.create({ customer: stripeCustomerId, ... })

    const invoiceId = `inv_${Date.now()}`

    return NextResponse.json(
      {
        id: invoiceId,
        invoiceNumber: `INV-${invoiceId.slice(-8).toUpperCase()}`,
        jobId,
        jobTitle,
        employerId,
        workerId,
        workerName,
        lineItems: lineItems ?? [{ description: jobTitle, quantity: 1, unitPrice: amount }],
        subtotal,
        tax,
        total,
        taxRate,
        currency: 'usd',
        status: 'draft',
        dueDate: new Date(Date.now() + dueInDays * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/invoices/generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
