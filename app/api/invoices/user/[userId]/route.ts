import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { toIsoTimestamp } from '@/lib/server/firestoreSerializers'

export const dynamic = 'force-dynamic'

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
    const fetchDocs = async (field: string) => {
      try {
        let q = adminDb
          .collection('invoices')
          .where(field, '==', userId)
          .orderBy('createdAt', 'desc')
        if (status) {
          q = q.where('status', '==', status)
        }
        return (await q.get()).docs
      } catch (error) {
        console.warn(
          `Falling back to unordered invoice query for ${field}; likely missing createdAt index.`,
          error,
        )
        let q = adminDb.collection('invoices').where(field, '==', userId)
        if (status) {
          q = q.where('status', '==', status)
        }
        return (await q.get()).docs
      }
    }

    const [asEmployer, asWorker] = await Promise.all([
      fetchDocs('employerId'),
      fetchDocs('workerId'),
    ])

    const map = new Map<string, Record<string, unknown>>()
    ;[...asEmployer, ...asWorker].forEach((d) => {
      const data = d.data() as Record<string, unknown>
      map.set(d.id, {
        id: d.id,
        ...data,
        createdAt: toIsoTimestamp(data.createdAt),
        updatedAt: toIsoTimestamp(data.updatedAt),
        paidAt: toIsoTimestamp(data.paidAt),
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
