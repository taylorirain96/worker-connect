import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateReviewSchema } from '@/lib/reviewValidation'
import { getReviewById, deleteReview } from '@/lib/reviews/firebase'
import { db } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

interface RouteContext {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    return NextResponse.json(review)
  } catch (error) {
    console.error('Get review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json()

    // Auth check – the caller must provide their userId
    const userId = request.headers.get('x-user-id') ?? body.userId
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    if (review.reviewerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: you can only edit your own reviews' }, { status: 403 })
    }

    const parsed = updateReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }
    if (parsed.data.rating !== undefined) updates.rating = parsed.data.rating
    if (parsed.data.content !== undefined) updates.comment = parsed.data.content
    if (parsed.data.title !== undefined) updates.title = parsed.data.title

    await updateDoc(doc(db, 'reviews', params.id), updates)

    const updated = { ...review, ...updates, updatedAt: new Date().toISOString() }
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // Auth check – require user ID from header only (avoids consuming body stream)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    if (review.reviewerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: you can only delete your own reviews' }, { status: 403 })
    }

    await deleteReview(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
