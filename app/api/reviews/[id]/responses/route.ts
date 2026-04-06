import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createResponseSchema, updateResponseSchema } from '@/lib/reviewValidation'
import {
  getReviewById,
  addReviewResponse,
  updateReviewResponse,
  deleteReviewResponse,
} from '@/lib/reviews/firebase'

interface RouteContext {
  params: { id: string }
}

/** POST /api/reviews/[id]/responses – Add a response to a review */
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

    // Only the reviewee (worker/employer being reviewed) can respond
    if (review.revieweeId !== userId) {
      return NextResponse.json(
        { error: 'Only the reviewed party can respond to reviews' },
        { status: 403 }
      )
    }

    if (review.response) {
      return NextResponse.json(
        { error: 'A response already exists. Use PUT to update it.' },
        { status: 409 }
      )
    }

    const parsed = createResponseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const response = await addReviewResponse(
      params.id,
      userId,
      body.authorName ?? review.revieweeName,
      body.authorAvatar,
      parsed.data.content
    )

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Add review response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/reviews/[id]/responses – Update the existing response */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json()

    const userId = request.headers.get('x-user-id') ?? body.userId
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (!review.response) {
      return NextResponse.json({ error: 'No response found to update' }, { status: 404 })
    }

    if (review.response.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden: you can only edit your own response' }, { status: 403 })
    }

    const parsed = updateResponseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await updateReviewResponse(params.id, parsed.data.content)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update review response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/reviews/[id]/responses – Delete the existing response */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json().catch(() => ({}))
    const effectiveUserId = userId ?? (body as { userId?: string }).userId

    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (!review.response) {
      return NextResponse.json({ error: 'No response found' }, { status: 404 })
    }

    if (review.response.authorId !== effectiveUserId) {
      return NextResponse.json({ error: 'Forbidden: you can only delete your own response' }, { status: 403 })
    }

    await deleteReviewResponse(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete review response error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
