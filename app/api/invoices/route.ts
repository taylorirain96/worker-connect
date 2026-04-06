import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET  /api/invoices?workerId=xxx  — list invoices for a worker
 * POST /api/invoices               — create a new invoice
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workerId = searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 })
    }

    // In production: fetch from Firestore via paymentService.getWorkerInvoices(workerId)
    const mockInvoices = [
      {
        id: 'inv_mock_001',
        jobId: 'job_1',
        jobTitle: 'Plumbing Repair — Kitchen Sink',
        employerId: 'emp_1',
        workerId,
        workerName: 'Alex Johnson',
        amount: 320,
        tax: 25.60,
        total: 345.60,
        status: 'paid',
        dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'inv_mock_002',
        jobId: 'job_2',
        jobTitle: 'Electrical Panel Upgrade',
        employerId: 'emp_2',
        workerId,
        workerName: 'Alex Johnson',
        amount: 850,
        tax: 68,
        total: 918,
        status: 'sent',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'inv_mock_003',
        jobId: 'job_3',
        jobTitle: 'HVAC Maintenance Service',
        employerId: 'emp_1',
        workerId,
        workerName: 'Alex Johnson',
        amount: 200,
        tax: 16,
        total: 216,
        status: 'overdue',
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
    ]

    return NextResponse.json({ invoices: mockInvoices })
  } catch (error) {
    console.error('List invoices error:', error)
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
      taxRate?: number
    }

    const { jobId, jobTitle, employerId, workerId, workerName, amount, taxRate = 0.08 } = body

    if (!jobId || !jobTitle || !employerId || !workerId || !workerName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tax = Math.round(amount * taxRate * 100) / 100
    const total = Math.round((amount + tax) * 100) / 100

    // In production: store in Firestore via paymentService.createInvoice(...)
    const invoiceId = `inv_${Date.now()}`

    return NextResponse.json({
      id: invoiceId,
      jobId,
      jobTitle,
      employerId,
      workerId,
      workerName,
      amount,
      tax,
      total,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
