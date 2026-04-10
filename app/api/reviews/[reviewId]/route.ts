import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getReviewById, deleteReview, moderateReview } from '@/lib/reviews/firebase'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  const params = await context.params
  try {
    const { reviewId } = params
    const review = await getReviewById(reviewId)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    return NextResponse.json(review)
  } catch (error) {
    console.error('Get review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  const params = await context.params
  try {
    const { reviewId } = params
    const body = await request.json()
    const { rating, comment, moderationStatus, moderatorId, moderatorNote } = body

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (comment !== undefined) {
      if (comment.trim().length < 10) {
        return NextResponse.json({ error: 'Comment must be at least 10 characters' }, { status: 400 })
      }
      if (comment.length > 500) {
        return NextResponse.json({ error: 'Comment must be 500 characters or fewer' }, { status: 400 })
      }
    }

    // Handle moderation status updates
    if (moderationStatus && moderatorId) {
      await moderateReview(reviewId, moderationStatus, moderatorId, moderatorNote)
      return NextResponse.json({ id: reviewId, moderationStatus, updatedAt: new Date().toISOString() })
    }

    // In production, update review fields in Firestore
    return NextResponse.json({ id: reviewId, ...body, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  const params = await context.params
  try {
    const { reviewId } = params
    await deleteReview(reviewId)
    return NextResponse.json({ message: 'Review deleted', id: reviewId })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
