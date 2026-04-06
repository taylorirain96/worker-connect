import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createReviewSchema, reviewQuerySchema } from '@/lib/reviewValidation'
import { createReview, getReviewsForEntity, getReviewAggregates } from '@/lib/reviews/firebase'
import type { ReviewSortBy } from '@/lib/reviews/firebase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raw = {
      workerId: searchParams.get('workerId') ?? undefined,
      clientId: searchParams.get('clientId') ?? undefined,
      jobId: searchParams.get('jobId') ?? undefined,
      rating: searchParams.get('rating') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    }

    const parsed = reviewQuerySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workerId, sort, limit, rating } = parsed.data
    const entityId = workerId ?? raw.clientId ?? raw.jobId ?? ''

    if (!entityId) {
      return NextResponse.json({ reviews: [], total: 0, averageRating: 0 })
    }

    const [result, aggregates] = await Promise.all([
      getReviewsForEntity(entityId, {
        sortBy: sort as ReviewSortBy,
        filterRating: rating,
        pageSize: limit,
      }),
      getReviewAggregates(entityId),
    ])

    return NextResponse.json({
      reviews: result.reviews,
      total: aggregates?.totalReviews ?? result.reviews.length,
      averageRating: aggregates?.averageRating ?? 0,
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { workerId, clientId, jobId, rating, title, content, photos } = parsed.data

    const review = await createReview({
      jobId,
      jobTitle: body.jobTitle ?? '',
      reviewType: 'worker_review',
      reviewerId: clientId,
      reviewerName: body.reviewerName ?? 'Anonymous',
      reviewerAvatar: body.reviewerAvatar,
      reviewerRole: 'employer',
      revieweeId: workerId,
      revieweeName: body.revieweeName ?? '',
      rating,
      categories: body.categories ?? { communication: rating, quality: rating, timeliness: rating, professionalism: rating },
      comment: content,
      photos: photos ?? [],
      photoStoragePaths: body.photoStoragePaths ?? [],
      isAnonymous: body.isAnonymous ?? false,
      ...(title ? { title } : {}),
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
