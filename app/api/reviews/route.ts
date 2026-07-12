import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getReviewsForEntity } from '@/lib/reviews/firebase'
import { adminDb } from '@/lib/firebase-admin'
import { sendReviewReceivedEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'
import { FieldValue } from 'firebase-admin/firestore'

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
    const {
      jobId,
      reviewerId,
      revieweeId,
      rating,
      comment,
      tags,
      reviewerName: bodyReviewerName,
      reviewerAvatar,
      reviewType: bodyReviewType,
    } = body

    const VALID_REVIEW_TYPES = ['worker_review', 'employer_review', 'enterprise_review'] as const
    type ReviewTypeValue = typeof VALID_REVIEW_TYPES[number]
    if (bodyReviewType !== undefined && !VALID_REVIEW_TYPES.includes(bodyReviewType as ReviewTypeValue)) {
      return NextResponse.json({ error: 'Invalid reviewType' }, { status: 400 })
    }
    // Default to worker_review when omitted; bodyReviewType is guaranteed valid at this point
    const reviewType: ReviewTypeValue = (bodyReviewType as ReviewTypeValue) ?? 'worker_review'

    if (!jobId || !reviewerId || !revieweeId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const trimmedComment = String(comment).trim()
    if (trimmedComment.length < 20) {
      return NextResponse.json({ error: 'Review must be at least 20 characters' }, { status: 400 })
    }

    if (trimmedComment.length > 500) {
      return NextResponse.json({ error: 'Review must be 500 characters or fewer' }, { status: 400 })
    }

    const sanitisedTags: string[] = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string') : []

    // Verify the job exists, is completed, and the reviewer is a party to it
    if (adminDb) {
      const REVIEW_GUARD_ERROR = 'Reviews can only be submitted for completed jobs you were involved in.'
      const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
      if (!jobSnap.exists) {
        return NextResponse.json({ error: REVIEW_GUARD_ERROR }, { status: 403 })
      }
      const jobData = jobSnap.data() as Record<string, unknown>
      if (jobData.status !== 'completed') {
        return NextResponse.json({ error: REVIEW_GUARD_ERROR }, { status: 403 })
      }
      const isParty =
        reviewerId === jobData.employerId || reviewerId === jobData.assignedWorkerId
      if (!isParty) {
        return NextResponse.json({ error: REVIEW_GUARD_ERROR }, { status: 403 })
      }
    }

    // Prevent duplicate reviews — one review per job per reviewer
    if (adminDb) {
      const existingSnap = await adminDb
        .collection('reviews')
        .where('jobId', '==', jobId)
        .where('reviewerId', '==', reviewerId)
        .limit(1)
        .get()

      if (!existingSnap.empty) {
        return NextResponse.json({ error: 'You have already reviewed this job' }, { status: 409 })
      }
    }

    const createdAt = new Date().toISOString()

    // Build review document
    const reviewData: Record<string, unknown> = {
      jobId,
      // Legacy fields kept for backwards compatibility with existing queries.
      // For worker_review: workerId = reviewee (the worker), homeownerId = reviewer (the employer/homeowner).
      // For employer_review: workerId = reviewer (the worker), homeownerId = reviewee (the employer).
      // Prefer reviewerId/revieweeId + reviewType for new logic.
      workerId: reviewType === 'employer_review' ? reviewerId : revieweeId,
      homeownerId: reviewType === 'employer_review' ? revieweeId : reviewerId,
      reviewerId,
      revieweeId,
      reviewType,
      rating,
      review: trimmedComment,
      comment: trimmedComment,
      tags: sanitisedTags,
      createdAt,
      reviewerName: bodyReviewerName ?? null,
      reviewerAvatar: reviewerAvatar ?? null,
    }

    let reviewId = `review_${Date.now()}`

    // Save to Firestore and recalculate worker rating
    if (adminDb) {
      const docRef = await adminDb.collection('reviews').add(reviewData)
      reviewId = docRef.id

      // Mark the job as having a review left (employer→worker or worker→employer)
      try {
        const jobUpdateField = reviewType === 'employer_review' ? 'workerReviewLeft' : 'reviewLeft'
        await adminDb.collection('jobs').doc(jobId).update({ [jobUpdateField]: true })
      } catch {
        // Non-fatal
      }

      // Recalculate the reviewee's aggregate rating (works for both worker and employer reviews)
      try {
        const reviewsSnap = await adminDb
          .collection('reviews')
          .where('revieweeId', '==', revieweeId)
          .where('reviewType', '==', reviewType)
          .get()
        const count = reviewsSnap.size
        let ratingSum = 0
        for (const d of reviewsSnap.docs) {
          const r = d.data().rating
          if (typeof r === 'number') ratingSum += r
        }
        const avg = count > 0 ? Math.round((ratingSum / count) * 10) / 10 : 0
        // Use separate fields to avoid mixing worker/employer ratings
        const ratingField = reviewType === 'employer_review' ? 'employerRating' : 'rating'
        const countField = reviewType === 'employer_review' ? 'employerReviewCount' : 'reviewCount'
        const updatePayload: Record<string, unknown> = {
          [ratingField]: avg,
          [countField]: count,
          updatedAt: FieldValue.serverTimestamp(),
        }
        if (reviewType !== 'employer_review') {
          updatePayload.averageRating = avg
        }
        await adminDb.collection('users').doc(revieweeId).update(updatePayload)
      } catch {
        // Non-fatal: aggregate update failure should not block review submission
      }

      // Send "Review Received" email to reviewee (non-blocking)
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
          const reviewerName = (reviewerData?.displayName ?? reviewerData?.name ?? bodyReviewerName ?? 'Someone') as string
          const snippet = trimmedComment.length > 150 ? `${trimmedComment.slice(0, 150)}\u2026` : trimmedComment
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
            link: reviewType === 'employer_review' ? `/profile/${revieweeId}` : `/workers/${revieweeId}`,
          })
        } catch (emailErr) {
          console.error('Failed to send review-received email:', emailErr)
        }
      })().catch(() => {})
    }

    return NextResponse.json({ ...reviewData, id: reviewId }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
