import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const revieweeId = searchParams.get('revieweeId')
    const reviewerId = searchParams.get('reviewerId')
    const jobId = searchParams.get('jobId')

    // In production, fetch from Firestore
    return NextResponse.json({ reviews: [], total: 0, averageRating: 0 })
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
