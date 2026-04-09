import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { addReviewResponse } from '@/lib/reviews/firebase'

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params
    const body = await request.json()
    const { authorId, authorName, authorAvatar, text } = body

    if (!authorId || !authorName) {
      return NextResponse.json({ error: 'authorId and authorName are required' }, { status: 400 })
    }

    if (!text || text.trim().length < 1) {
      return NextResponse.json({ error: 'Response text is required' }, { status: 400 })
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'Response must be 1000 characters or fewer' }, { status: 400 })
    }

    const response = await addReviewResponse(reviewId, authorId, authorName, authorAvatar, text)
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Add response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
