import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

/**
 * GET /api/payments/history?userId=xxx&role=worker|employer&limit=20&offset=0
 * Returns paginated payment history for a user from Firestore.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') ?? 'worker'
    const limitParam = Math.min(Number(searchParams.get('limit') ?? '20'), 100)
    const offset = Number(searchParams.get('offset') ?? '0')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ payments: [], total: 0, limit: limitParam, offset }, { status: 200 })
    }

    const field = role === 'employer' ? 'employerId' : 'workerId'
    let q = adminDb
      .collection('payments')
      .where(field, '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limitParam + offset)

    if (status) {
      q = q.where('status', '==', status)
    }

    const snap = await q.get()
    const all = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        id: d.id,
        ...data,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      }
    })

    const paginated = all.slice(offset, offset + limitParam)

    return NextResponse.json({
      payments: paginated,
      total: all.length,
      limit: limitParam,
      offset,
    })
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setContext('payments_history', {
        route: '/api/payments/history',
      })
      Sentry.captureException(error)
    })
    console.error('GET /api/payments/history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
