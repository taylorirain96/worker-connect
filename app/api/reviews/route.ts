import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getReviewsForEntity } from '@/lib/reviews/firebase'
import { adminDb } from '@/lib/firebase-admin'
import { sendReviewReceivedEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const workerId = searchParams.get('workerId')
    const entityId = searchParams.get('entityId') ?? workerId
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'highest' | 'lowest' | 'most_helpful') ?? 'recent'
    const filterRating = searchParams.get('filterRating') ? parseInt(searchParams.get('filterRating')!) : undefined
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10')

    if (!entityId) {
      return NextResponse.json({ error: 'entityId or workerId query param is required' }, { status: 400 })
    }

    const { reviews, lastDoc: _lastDoc } = await getReviewsForEntity(entityId, { sortBy, filterRating, pageSize })
    return NextResponse.json({ reviews, count: reviews.length })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, reviewerId, revieweeId, rating, comment } = body

    if (!jobId || !reviewerId || !revieweeId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({ error: 'Comment must be at least 10 characters' }, { status: 400 })
    }

    if (comment.length > 500) {
      return NextResponse.json({ error: 'Comment must be 500 characters or fewer' }, { status: 400 })
    }

    const review = {
      id: `review_${Date.now()}`,
      jobId,
      reviewerId,
      revieweeId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }

    // In production, save to Firestore and update user's average rating

    // Send "Review Received" email to reviewee (non-blocking)
    if (adminDb) {
      ;(async () => {
        try {
          const [revieweeSnap, reviewerSnap] = await Promise.all([
            adminDb.collection('users').doc(revieweeId).get(),
            adminDb.collection('users').doc(reviewerId).get(),
          ])
          const revieweeData = revieweeSnap.exists ? revieweeSnap.data() : null
          const reviewerData = reviewerSnap.exists ? reviewerSnap.data() : null
          const revieweeEmail = revieweeData?.email as string | undefined
          const revieweeName = (revieweeData?.displayName ?? revieweeData?.name ?? 'there') as string
          const reviewerName = (reviewerData?.displayName ?? reviewerData?.name ?? 'Someone') as string
          const snippet = comment.length > 150 ? `${comment.slice(0, 150)}\u2026` : comment
          if (revieweeEmail) {
            await sendReviewReceivedEmail({
              revieweeEmail,
              revieweeName,
              reviewerName,
              rating,
              reviewSnippet: snippet,
              revieweeId,
            })
          }

          // Push notification to reviewee
          await sendAdminNotification({
            userId: revieweeId,
            title: `New ${rating}-star review ⭐`,
            body: `${reviewerName} left you a review: "${snippet}"`,
            type: 'new_review',
            link: `/workers/${revieweeId}`,
          })
        } catch (emailErr) {
          console.error('Failed to send review-received email:', emailErr)
        }
      })().catch(() => {})
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
