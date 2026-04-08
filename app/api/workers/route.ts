export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { UserProfile } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const minRating = searchParams.get('minRating')
    const availability = searchParams.get('availability')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let q = adminDb
      .collection('users')
      .where('role', '==', 'worker')
      .orderBy('rating', 'desc')
      .limit(limit * page) // over-fetch then slice for simple offset pagination

    if (availability) {
      q = adminDb
        .collection('users')
        .where('role', '==', 'worker')
        .where('availability', '==', availability)
        .orderBy('rating', 'desc')
        .limit(limit * page)
    }

    const snapshot = await q.get()
    let workers = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile))

    // Client-side filters for fields that can't be combined with orderBy in Firestore
    if (location) {
      const loc = location.toLowerCase()
      workers = workers.filter((w) => w.location?.toLowerCase().includes(loc))
    }
    if (minRating) {
      const minRatingValue = parseFloat(minRating)
      workers = workers.filter((w) => (w.rating ?? 0) >= minRatingValue)
    }
    if (category) {
      const cat = category.toLowerCase()
      workers = workers.filter((w) =>
        w.skills?.some((s) => s.toLowerCase().includes(cat))
      )
    }

    const total = workers.length
    // Secondary in-memory sort: blend rating (60%) + completionRate (40%).
    // The 60/40 split prioritises overall quality (rating) while giving meaningful
    // weight to contract follow-through (completionRate), surfacing Mover Mode
    // candidates who consistently complete what they accept.
    workers.sort((a, b) => {
      const scoreA = ((a.rating ?? 0) / 5) * 0.6 + (a.completionRate ?? 0) * 0.4
      const scoreB = ((b.rating ?? 0) / 5) * 0.6 + (b.completionRate ?? 0) * 0.4
      return scoreB - scoreA
    })
    // Simple page-based slicing
    const start = (page - 1) * limit
    const paginated = workers.slice(start, start + limit)

    return NextResponse.json({ workers: paginated, total, page, limit })
  } catch (error) {
    console.error('Get workers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}