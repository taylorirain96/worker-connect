import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getReviewsForEntity } from '@/lib/reviews/firebase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { searchParams } = request.nextUrl
    const workerId = searchParams.get('workerId')
    const entityId = searchParams.get('entityId') ?? workerId
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'highest' | 'lowest' | 'most_helpful') ?? 'recent'
    const filterRating = searchParams.get('filterRating') ? parseInt(searchParams.get('filterRating')!) : undefined
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10')

    if (!entityId) {
      return NextResponse.json({ error: 'entityId or workerId query param is required' }, { status: 400 })
    }

    const { reviews, lastDoc: _lastDoc } = await getReviewsForEntity(entityId, { sortBy, filterRating, pageSize })
    return NextResponse.json({ reviews, count: reviews.length })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, reviewerId, revieweeId, rating, comment } = body

    if (!jobId || !reviewerId || !revieweeId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({ error: 'Comment must be at least 10 characters' }, { status: 400 })
    }

    if (comment.length > 500) {
      return NextResponse.json({ error: 'Comment must be 500 characters or fewer' }, { status: 400 })
    }

    const review = {
      id: `review_${Date.now()}`,
      jobId,
      reviewerId,
      revieweeId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }

    // In production, save to Firestore and update user's average rating
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
