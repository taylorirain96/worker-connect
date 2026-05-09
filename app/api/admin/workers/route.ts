import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/workers
 * Query params: limit, offset, rating, verificationStatus, region, search, sortBy, order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const ratingFilter = searchParams.get('rating')
    const verificationStatus = searchParams.get('verificationStatus')
    const region = searchParams.get('region')
    const search = searchParams.get('search')?.toLowerCase()
    const sortBy = searchParams.get('sortBy') ?? 'joinedAt'
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'

    let q = adminDb.collection('users').where('role', '==', 'worker') as FirebaseFirestore.Query

    if (verificationStatus) {
      q = q.where('verificationStatus', '==', verificationStatus)
    }

    q = q.orderBy(sortBy === 'joinedAt' ? 'createdAt' : sortBy, order)

    const snap = await q.get()
    type WorkerRow = {
      id: string
      name: string
      email: string
      rating: number
      jobsCompleted: number
      totalEarnings: number
      verificationStatus: string
      isActive: boolean
      region: string
      category: string
      joinedAt: string
    }
    let items: WorkerRow[] = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        name: (d.displayName ?? d.name ?? '') as string,
        email: (d.email ?? '') as string,
        rating: (d.rating ?? 0) as number,
        jobsCompleted: (d.jobsCompleted ?? 0) as number,
        totalEarnings: (d.totalEarnings ?? 0) as number,
        verificationStatus: (d.verificationStatus ?? 'unverified') as string,
        isActive: (d.isActive ?? true) as boolean,
        region: (d.region ?? '') as string,
        category: (d.category ?? '') as string,
        joinedAt: d.createdAt?.toDate?.()?.toISOString?.() ?? (d.createdAt as string | undefined) ?? '',
      }
    })

    if (ratingFilter) {
      const [min, max] = ratingFilter.split('-').map(Number)
      items = items.filter((w) => w.rating >= (min ?? 0) && w.rating <= (max ?? 5))
    }

    if (region) {
      items = items.filter((w) => w.region === region)
    }

    if (search) {
      items = items.filter(
        (w) =>
          w.name.toLowerCase().includes(search) ||
          w.email.toLowerCase().includes(search) ||
          w.id.includes(search)
      )
    }

    const total = items.length
    const paginated = items.slice(offset, offset + limit)

    return NextResponse.json({ items: paginated, total, limit, offset })
  } catch (error) {
    console.error('GET /api/admin/workers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
