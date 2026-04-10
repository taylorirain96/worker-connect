import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { moderateReview, getReviewById } from '@/lib/reviews/firebase'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    const body = await request.json()
    const { moderatorId, note } = body

    if (!moderatorId) {
      return NextResponse.json({ error: 'moderatorId is required' }, { status: 400 })
    }

    // In production, verify the caller has admin role via Firebase Admin SDK

    const review = await getReviewById(id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Toggle: unhide a removed review back to approved, or hide any visible review
    const newStatus = review.moderationStatus === 'removed' ? 'approved' : 'removed'
    await moderateReview(id, newStatus, moderatorId, note)

    return NextResponse.json({ reviewId: id, moderationStatus: newStatus })
  } catch (error) {
    console.error('Hide/unhide review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
