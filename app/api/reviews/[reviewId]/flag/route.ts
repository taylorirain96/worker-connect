import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { reportReview } from '@/lib/reviews/firebase'
import type { ReviewReport } from '@/types'

const VALID_REASONS: ReviewReport['reason'][] = ['spam', 'inappropriate', 'fake', 'harassment', 'other']

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  const params = await context.params
  try {
    const { reviewId } = params
    const body = await request.json()
    const { reporterId, reason, description } = body

    if (!reporterId) {
      return NextResponse.json({ error: 'reporterId is required' }, { status: 400 })
    }

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: `reason must be one of: ${VALID_REASONS.join(', ')}` },
        { status: 400 }
      )
    }

    await reportReview(reviewId, reporterId, reason as ReviewReport['reason'], description)
    return NextResponse.json({ reviewId, status: 'flagged' }, { status: 201 })
  } catch (error) {
    console.error('Flag review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
