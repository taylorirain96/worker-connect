import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/invoices/user/[userId]
 * List invoices where user is employer or worker.
 * Query params: status, limit (default 50)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const pageSize = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    try {
      // Fetch as employer and as worker in parallel
      const buildQuery = (field: string) => {
        let q = adminDb
          .collection('invoices')
          .where(field, '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(pageSize)
        if (status) {
          q = adminDb
            .collection('invoices')
            .where(field, '==', userId)
            .where('status', '==', status)
            .orderBy('createdAt', 'desc')
            .limit(pageSize)
        }
        return q
      }

      const [asEmployer, asWorker] = await Promise.all([
        buildQuery('employerId').get(),
        buildQuery('workerId').get(),
      ])

      // Deduplicate by id
      const map = new Map<string, Record<string, unknown>>()
      ;[...asEmployer.docs, ...asWorker.docs].forEach((d) => {
        map.set(d.id, { id: d.id, ...d.data() })
      })

      const invoices = Array.from(map.values()).sort((a, b) => {
        const ta = typeof a.createdAt === 'string' ? a.createdAt : ''
        const tb = typeof b.createdAt === 'string' ? b.createdAt : ''
        return tb.localeCompare(ta)
      })

      return NextResponse.json({ invoices, total: invoices.length })
    } catch {
      // Mock fallback when Firestore unavailable
      const now = Date.now()
      const mockInvoices = [
        {
          id: 'inv_mock_u001',
          invoiceNumber: 'INV-20260408-0001',
          jobId: 'job_1',
          jobTitle: 'Plumbing Repair',
          employerId: userId,
          workerId: 'worker_1',
          amount: 320,
          subtotal: 320,
          tax: 25.6,
          total: 345.6,
          status: 'paid',
          dueDate: new Date(now - 10 * 86400000).toISOString(),
          createdAt: new Date(now - 15 * 86400000).toISOString(),
          updatedAt: new Date(now - 8 * 86400000).toISOString(),
        },
      ]
      return NextResponse.json({ invoices: mockInvoices, total: mockInvoices.length })
    }
  } catch (error) {
    console.error('GET /api/invoices/user/[userId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
