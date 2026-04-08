import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type {
  DetailedReview,
  ReviewResponse,
  ReviewVote,
  ReviewReport,
  ReviewAggregates,
  CategoryRatings,
  ReviewModerationStatus,
} from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toReview(d: QueryDocumentSnapshot<DocumentData>): DetailedReview {
  const data = d.data()
  return {
    id: d.id,
    ...(data as Omit<DetailedReview, 'id'>),
  }
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────

export async function uploadReviewPhoto(
  reviewerId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; storagePath: string }> {
  if (!storage) throw new Error('Firebase Storage is not configured')
  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `review-photos/${reviewerId}/${Date.now()}.${ext}`
  const storageRef = ref(storage, storagePath)

  await new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file)
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => resolve()
    )
  })

  const url = await getDownloadURL(storageRef)
  return { url, storagePath }
}

export async function deleteReviewPhoto(storagePath: string): Promise<void> {
  if (!storage) return
  try {
    await deleteObject(ref(storage, storagePath))
  } catch {
    // Ignore – may already be deleted
  }
}

// ─── Create Review ────────────────────────────────────────────────────────────

export async function createReview(
  data: Omit<DetailedReview, 'id' | 'helpfulCount' | 'unhelpfulCount' | 'moderationStatus' | 'createdAt' | 'updatedAt'>
): Promise<DetailedReview> {
  if (!db) throw new Error('Firestore is not configured')

  const docRef = await addDoc(collection(db, 'reviews'), {
    ...data,
    helpfulCount: 0,
    unhelpfulCount: 0,
    moderationStatus: 'approved',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Update rating aggregates
  await updateAggregates(data.revieweeId, data.reviewType === 'worker_review' ? 'worker' : 'enterprise')

  return {
    id: docRef.id,
    ...data,
    helpfulCount: 0,
    unhelpfulCount: 0,
    moderationStatus: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ─── Read Reviews ─────────────────────────────────────────────────────────────

export type ReviewSortBy = 'recent' | 'highest' | 'lowest' | 'most_helpful'

export interface ReviewQueryOptions {
  sortBy?: ReviewSortBy
  filterRating?: number
  keyword?: string
  pageSize?: number
  after?: QueryDocumentSnapshot<DocumentData>
}

export async function getReviewsForEntity(
  entityId: string,
  options: ReviewQueryOptions = {}
): Promise<{ reviews: DetailedReview[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  if (!db) return { reviews: [], lastDoc: null }

  const { sortBy = 'recent', filterRating, pageSize = 10, after: afterDoc } = options

  let q = query(
    collection(db, 'reviews'),
    where('revieweeId', '==', entityId),
    where('moderationStatus', '==', 'approved')
  )

  if (filterRating) {
    q = query(q, where('rating', '==', filterRating))
  }

  if (sortBy === 'recent') {
    q = query(q, orderBy('createdAt', 'desc'))
  } else if (sortBy === 'highest') {
    q = query(q, orderBy('rating', 'desc'), orderBy('createdAt', 'desc'))
  } else if (sortBy === 'lowest') {
    q = query(q, orderBy('rating', 'asc'), orderBy('createdAt', 'desc'))
  } else if (sortBy === 'most_helpful') {
    q = query(q, orderBy('helpfulCount', 'desc'), orderBy('createdAt', 'desc'))
  }

  q = query(q, limit(pageSize))
  if (afterDoc) q = query(q, startAfter(afterDoc))

  const snap = await getDocs(q)
  const reviews = snap.docs.map(toReview)
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null
  return { reviews, lastDoc }
}

export async function getReviewById(reviewId: string): Promise<DetailedReview | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'reviews', reviewId))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<DetailedReview, 'id'>) }
}

export async function getPendingModerationReviews(maxResults = 50): Promise<DetailedReview[]> {
  if (!db) return []
  const q = query(
    collection(db, 'reviews'),
    where('moderationStatus', '==', 'pending'),
    orderBy('createdAt', 'asc'),
    limit(maxResults)
  )
  const snap = await getDocs(q)
  return snap.docs.map(toReview)
}

export async function getFlaggedReviews(maxResults = 50): Promise<DetailedReview[]> {
  if (!db) return []
  const q = query(
    collection(db, 'reviews'),
    where('moderationStatus', '==', 'flagged'),
    orderBy('createdAt', 'asc'),
    limit(maxResults)
  )
  const snap = await getDocs(q)
  return snap.docs.map(toReview)
}

// ─── Update / Delete Review ───────────────────────────────────────────────────

export async function moderateReview(
  reviewId: string,
  status: ReviewModerationStatus,
  moderatorId: string,
  note?: string
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'reviews', reviewId), {
    moderationStatus: status,
    moderatorId,
    moderatorNote: note ?? '',
    updatedAt: serverTimestamp(),
  })
}

export async function deleteReview(reviewId: string): Promise<void> {
  if (!db) return
  const snap = await getDoc(doc(db, 'reviews', reviewId))
  if (!snap.exists()) return
  const review = { id: snap.id, ...(snap.data() as Omit<DetailedReview, 'id'>) }

  // Remove photos from storage
  for (const path of review.photoStoragePaths ?? []) {
    await deleteReviewPhoto(path)
  }
  await deleteDoc(doc(db, 'reviews', reviewId))
}

// ─── Voting ───────────────────────────────────────────────────────────────────

export async function voteReview(
  reviewId: string,
  userId: string,
  vote: 'helpful' | 'unhelpful'
): Promise<void> {
  if (!db) return
  const voteId = `${reviewId}_${userId}`
  const voteRef = doc(db, 'reviewVotes', voteId)
  const existing = await getDoc(voteRef)

  if (existing.exists()) {
    const prev = (existing.data() as ReviewVote).vote
    if (prev === vote) return // no change
    // Switch vote
    await updateDoc(voteRef, { vote, updatedAt: serverTimestamp() })
    await updateDoc(doc(db, 'reviews', reviewId), {
      [`${prev}Count`]: increment(-1),
      [`${vote}Count`]: increment(1),
    })
  } else {
    await setDoc(voteRef, { reviewId, userId, vote, createdAt: serverTimestamp() })
    await updateDoc(doc(db, 'reviews', reviewId), {
      [`${vote}Count`]: increment(1),
    })
  }
}

export async function getUserVote(reviewId: string, userId: string): Promise<'helpful' | 'unhelpful' | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'reviewVotes', `${reviewId}_${userId}`))
  if (!snap.exists()) return null
  return (snap.data() as ReviewVote).vote
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function reportReview(
  reviewId: string,
  reporterId: string,
  reason: ReviewReport['reason'],
  description?: string
): Promise<void> {
  if (!db) return
  await addDoc(collection(db, 'reviewReports'), {
    reviewId,
    reporterId,
    reason,
    description: description ?? '',
    createdAt: serverTimestamp(),
  })
  // Flag review for moderation
  await updateDoc(doc(db, 'reviews', reviewId), {
    moderationStatus: 'flagged',
    updatedAt: serverTimestamp(),
  })
}

// ─── Responses ───────────────────────────────────────────────────────────────

export async function addReviewResponse(
  reviewId: string,
  authorId: string,
  authorName: string,
  authorAvatar: string | undefined,
  text: string
): Promise<ReviewResponse> {
  if (!db) throw new Error('Firestore is not configured')
  const response: Omit<ReviewResponse, 'id'> = {
    reviewId,
    authorId,
    authorName,
    authorAvatar,
    text,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await updateDoc(doc(db, 'reviews', reviewId), {
    response: { ...response, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    updatedAt: serverTimestamp(),
  })
  return { id: reviewId, ...response }
}

export async function updateReviewResponse(reviewId: string, text: string): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'reviews', reviewId), {
    'response.text': text,
    'response.updatedAt': serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteReviewResponse(reviewId: string): Promise<void> {
  if (!db) return
  const snap = await getDoc(doc(db, 'reviews', reviewId))
  if (!snap.exists()) return
  const review = snap.data() as Omit<DetailedReview, 'id'>
  if (!review.response) return

  const { revieweeId, reviewType } = review
  await updateDoc(doc(db, 'reviews', reviewId), {
    response: null,
    updatedAt: serverTimestamp(),
  })
  // Recompute response rate
  await updateAggregates(revieweeId, reviewType === 'worker_review' ? 'worker' : 'enterprise')
}

// ─── Aggregates ───────────────────────────────────────────────────────────────

export async function getReviewAggregates(entityId: string): Promise<ReviewAggregates | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'reviewAggregates', entityId))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<ReviewAggregates, 'id'>) }
}

/** Recompute and persist aggregates for an entity */
export async function updateAggregates(
  entityId: string,
  entityType: 'worker' | 'enterprise'
): Promise<ReviewAggregates> {
  if (!db) {
    return {
      id: entityId,
      entityId,
      entityType,
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {},
      categoryAverages: { communication: 0, quality: 0, timeliness: 0, professionalism: 0 },
      responseRate: 0,
      updatedAt: new Date().toISOString(),
    }
  }

  const q = query(
    collection(db, 'reviews'),
    where('revieweeId', '==', entityId),
    where('moderationStatus', '==', 'approved')
  )
  const snap = await getDocs(q)
  const reviews = snap.docs.map((d) => d.data() as Omit<DetailedReview, 'id'>)

  const totalReviews = reviews.length
  if (totalReviews === 0) {
    const empty: ReviewAggregates = {
      id: entityId,
      entityId,
      entityType,
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      categoryAverages: { communication: 0, quality: 0, timeliness: 0, professionalism: 0 },
      responseRate: 0,
      updatedAt: new Date().toISOString(),
    }
    await setDoc(doc(db, 'reviewAggregates', entityId), { ...empty, updatedAt: serverTimestamp() })
    return empty
  }

  const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  let sumRating = 0
  const catSum: CategoryRatings = { communication: 0, quality: 0, timeliness: 0, professionalism: 0 }
  let withResponse = 0

  for (const r of reviews) {
    sumRating += r.rating
    dist[String(r.rating)] = (dist[String(r.rating)] ?? 0) + 1
    catSum.communication += r.categories?.communication ?? 0
    catSum.quality += r.categories?.quality ?? 0
    catSum.timeliness += r.categories?.timeliness ?? 0
    catSum.professionalism += r.categories?.professionalism ?? 0
    if (r.response) withResponse++
  }

  const categoryAverages: CategoryRatings = {
    communication: Math.round((catSum.communication / totalReviews) * 10) / 10,
    quality: Math.round((catSum.quality / totalReviews) * 10) / 10,
    timeliness: Math.round((catSum.timeliness / totalReviews) * 10) / 10,
    professionalism: Math.round((catSum.professionalism / totalReviews) * 10) / 10,
  }

  const aggregates: ReviewAggregates = {
    id: entityId,
    entityId,
    entityType,
    totalReviews,
    averageRating: Math.round((sumRating / totalReviews) * 10) / 10,
    ratingDistribution: dist,
    categoryAverages,
    responseRate: Math.round((withResponse / totalReviews) * 100),
    updatedAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'reviewAggregates', entityId), {
    ...aggregates,
    updatedAt: serverTimestamp(),
  })

  return aggregates
}
