import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/employers
 * Query params: limit, offset, verificationStatus, search, sortBy, order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const verificationStatus = searchParams.get('verificationStatus')
    const search = searchParams.get('search')?.toLowerCase()
    const sortBy = searchParams.get('sortBy') ?? 'joinedAt'
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'

    let q = adminDb.collection('users').where('role', '==', 'employer') as FirebaseFirestore.Query

    if (verificationStatus) {
      q = q.where('verificationStatus', '==', verificationStatus)
    }

    q = q.orderBy(sortBy === 'joinedAt' ? 'createdAt' : sortBy, order)

    const snap = await q.get()
    type EmployerRow = {
      id: string
      companyName: string
      email: string
      jobsPosted: number
      totalSpent: number
      activeJobs: number
      verificationStatus: string
      joinedAt: string
    }
    let items: EmployerRow[] = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        companyName: (d.companyName ?? d.displayName ?? d.name ?? '') as string,
        email: (d.email ?? '') as string,
        jobsPosted: (d.jobsPosted ?? 0) as number,
        totalSpent: (d.totalSpent ?? 0) as number,
        activeJobs: (d.activeJobs ?? 0) as number,
        verificationStatus: (d.verificationStatus ?? 'unverified') as string,
        joinedAt: d.createdAt?.toDate?.()?.toISOString?.() ?? (d.createdAt as string | undefined) ?? '',
      }
    })

    if (search) {
      items = items.filter(
        (e) =>
          e.companyName.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search) ||
          e.id.includes(search)
      )
    }

    const total = items.length
    const paginated = items.slice(offset, offset + limit)

    return NextResponse.json({ items: paginated, total, limit, offset })
  } catch (error) {
    console.error('GET /api/admin/employers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
