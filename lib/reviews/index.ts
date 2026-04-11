/**
 * Lot 8 – Reviews & Ratings: simplified helpers for the worker review system.
 * Builds on top of the existing lib/reviews/firebase.ts infrastructure.
 */

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  createReview,
  getReviewsForEntity,
  getReviewById,
  addReviewResponse,
} from './firebase'
import type { DetailedReview } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum number of reviews fetched per worker in a single call */
const MAX_REVIEWS_PER_PAGE = 100

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkerReviewInput {
  jobId: string
  jobTitle: string
  workerId: string
  workerName: string
  employerId: string
  employerName: string
  employerPhotoURL?: string
  rating: number      // 1–5
  comment: string
}

// ─── Submit a review for a worker after job completion ────────────────────────

export async function submitWorkerReview(
  input: WorkerReviewInput
): Promise<DetailedReview> {
  if (!db) throw new Error('Firestore is not configured')

  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5.')
  }
  if (!input.comment || input.comment.trim().length < 10) {
    throw new Error('Comment must be at least 10 characters.')
  }
  if (input.comment.length > 500) {
    throw new Error('Comment must be 500 characters or fewer.')
  }

  // Write review to Firestore `reviews` collection
  const review = await createReview({
    jobId: input.jobId,
    jobTitle: input.jobTitle,
    reviewType: 'worker_review',
    reviewerId: input.employerId,
    reviewerName: input.employerName,
    reviewerAvatar: input.employerPhotoURL,
    reviewerRole: 'employer',
    revieweeId: input.workerId,
    revieweeName: input.workerName,
    rating: input.rating,
    categories: {
      communication: input.rating,
      quality: input.rating,
      timeliness: input.rating,
      professionalism: input.rating,
    },
    comment: input.comment,
    photos: [],
    photoStoragePaths: [],
    isAnonymous: false,
  })

  // Recalculate and update worker's aggregate rating on their user profile
  try {
    const snap = await getDocs(
      query(
        collection(db, 'reviews'),
        where('revieweeId', '==', input.workerId),
        where('moderationStatus', '==', 'approved')
      )
    )
    const count = snap.size
    const sum = snap.docs.reduce((acc, d) => acc + ((d.data().rating as number) ?? 0), 0)
    const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0
    await updateDoc(doc(db, 'users', input.workerId), {
      rating: avg,
      reviewCount: count,
    })
  } catch {
    // Non-fatal: aggregate update failure should not block review submission
  }

  // Mark job as having a review left
  try {
    await updateDoc(doc(db, 'jobs', input.jobId), { reviewLeft: true })
  } catch {
    // Non-fatal
  }

  return review
}

// ─── Get all reviews for a worker ────────────────────────────────────────────

export async function getWorkerReviews(workerId: string): Promise<DetailedReview[]> {
  const { reviews } = await getReviewsForEntity(workerId, {
    sortBy: 'recent',
    pageSize: MAX_REVIEWS_PER_PAGE,
  })
  return reviews
}

// ─── Check if an employer has already reviewed a worker for a specific job ────

export async function hasReviewed(
  jobId: string,
  employerId: string
): Promise<boolean> {
  if (!db) return false
  const snap = await getDocs(
    query(
      collection(db, 'reviews'),
      where('jobId', '==', jobId),
      where('reviewerId', '==', employerId),
      limit(1)
    )
  )
  return !snap.empty
}

// ─── Add a worker's response to a review ─────────────────────────────────────

export async function respondToReview(
  reviewId: string,
  responderId: string,
  responderName: string,
  response: string
): Promise<void> {
  await addReviewResponse(reviewId, responderId, responderName, undefined, response)
}

// ─── Get a single review by ID ────────────────────────────────────────────────

export async function getReview(reviewId: string): Promise<DetailedReview | null> {
  return getReviewById(reviewId)
}
