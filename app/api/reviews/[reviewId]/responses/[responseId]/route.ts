import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateReviewResponse, deleteReviewResponse } from '@/lib/reviews/firebase'

// NOTE: The current data model stores one response per review (review.response).
// The responseId in the URL identifies that response. Future support for multiple
// responses per review would require passing responseId to the firebase functions.

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ reviewId: string; responseId: string }> }
) {
  const params = await context.params
  try {
    const { reviewId } = params
    const body = await request.json()
    const { text } = body

    if (!text || text.trim().length < 1) {
      return NextResponse.json({ error: 'Response text is required' }, { status: 400 })
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'Response must be 1000 characters or fewer' }, { status: 400 })
    }

    await updateReviewResponse(reviewId, text)
    return NextResponse.json({ reviewId, text, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Update response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ reviewId: string; responseId: string }> }
) {
  const params = await context.params
  try {
    const { reviewId } = params
    await deleteReviewResponse(reviewId)
    return NextResponse.json({ reviewId, message: 'Response deleted' })
  } catch (error) {
    console.error('Delete response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
