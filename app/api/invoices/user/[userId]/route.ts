import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function toIso(value: unknown): string | undefined {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return undefined
}

/**
 * GET /api/invoices/user/[userId]
 * List invoices where user is employer or worker.
 * Query params: status, limit (default 50)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const pageSize = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
    const buildQuery = (field: string) => {
      let q = adminDb
        .collection('invoices')
        .where(field, '==', userId)
        .limit(pageSize)
      if (status) {
        q = q.where('status', '==', status)
      }
      return q
    }

    const [asEmployer, asWorker] = await Promise.all([
      buildQuery('employerId').get(),
      buildQuery('workerId').get(),
    ])

    const map = new Map<string, Record<string, unknown>>()
    ;[...asEmployer.docs, ...asWorker.docs].forEach((d) => {
      const data = d.data() as Record<string, unknown>
      map.set(d.id, {
        id: d.id,
        ...data,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
        paidAt: toIso(data.paidAt),
      })
    })

    const invoices = Array.from(map.values())
      .sort((a, b) => {
        const ta = typeof a.createdAt === 'string' ? a.createdAt : ''
        const tb = typeof b.createdAt === 'string' ? b.createdAt : ''
        return tb.localeCompare(ta)
      })
      .slice(0, pageSize)

    return NextResponse.json({ invoices, total: invoices.length })
  } catch (error) {
    console.error('GET /api/invoices/user/[userId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
