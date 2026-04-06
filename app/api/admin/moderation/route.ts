import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { moderationQuerySchema, moderationActionSchema } from '@/lib/reviewValidation'
import { getFlaggedReviews, getPendingModerationReviews, moderateReview, deleteReview, getReviewById } from '@/lib/reviews/firebase'
import type { ReviewModerationStatus } from '@/types'

export const dynamic = 'force-dynamic'

/** GET /api/admin/moderation?limit=20&offset=0 – Get reviews needing moderation */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raw = {
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    }

    const parsed = moderationQuerySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { limit } = parsed.data

    const [flagged, pending] = await Promise.all([
      getFlaggedReviews(limit),
      getPendingModerationReviews(limit),
    ])

    // Deduplicate by id
    const seen = new Set<string>()
    const combined = [...flagged, ...pending].filter((r) => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })

    const stats = {
      total: combined.length,
      flagged: flagged.length,
      pending: pending.length,
    }

    return NextResponse.json({ reviews: combined, stats })
  } catch (error) {
    console.error('Get moderation reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/admin/moderation – Bulk moderate reviews */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Admin auth check
    const userId = request.headers.get('x-user-id') ?? body.userId
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewId, ...actionData } = body
    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })
    }

    const review = await getReviewById(reviewId)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const parsed = moderationActionSchema.safeParse(actionData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { action, note } = parsed.data

    if (action === 'remove') {
      await deleteReview(reviewId)
      return NextResponse.json({ success: true, action: 'removed' })
    }

    const statusMap: Record<string, ReviewModerationStatus> = {
      hide: 'removed',
      unhide: 'approved',
      approve: 'approved',
    }

    await moderateReview(reviewId, statusMap[action], userId, note)
    return NextResponse.json({ success: true, action, newStatus: statusMap[action] })
  } catch (error) {
    console.error('Moderation action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
