import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { flagReviewSchema } from '@/lib/reviewValidation'
import { getReviewById, reportReview } from '@/lib/reviews/firebase'

interface RouteContext {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json()

    // Auth check
    const userId = request.headers.get('x-user-id') ?? body.userId
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Users cannot flag their own reviews
    if (review.reviewerId === userId || review.revieweeId === userId) {
      return NextResponse.json({ error: 'You cannot flag your own review' }, { status: 400 })
    }

    const parsed = flagReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { reason, description } = parsed.data
    await reportReview(params.id, userId, reason as Parameters<typeof reportReview>[2], description)

    return NextResponse.json({ success: true, message: 'Review flagged for moderation' })
  } catch (error) {
    console.error('Flag review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
