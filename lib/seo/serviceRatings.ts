import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import type { JobCategory } from '@/types'

interface ServiceAggregateRating {
  ratingValue: number
  reviewCount: number
  bestRating: 5
  worstRating: 1
}

const SERVICE_CATEGORY_MAP: Record<string, JobCategory[]> = {
  plumbing: ['plumbing'],
  electrical: ['electrical'],
  'heat-pumps-air-conditioning': ['hvac'],
  handyman: ['general'],
  cleaning: ['cleaning'],
  'moving-removalists': ['moving'],
  'landscaping-gardening': ['landscaping'],
  painting: ['painting'],
  roofing: ['roofing'],
  flooring: ['flooring'],
  locksmith: ['general'],
  'pest-control': ['general'],
  'rubbish-removal': ['general', 'moving'],
  'appliance-repair': ['general'],
  'car-detailing': ['cleaning'],
  plasterer: ['carpentry'],
  builder: ['carpentry'],
  'solar-installation': ['electrical'],
  fencing: ['carpentry'],
  waterproofing: ['roofing'],
  tiling: ['flooring'],
  concreting: ['carpentry'],
  insulation: ['carpentry'],
  'asbestos-removal': ['general'],
  'carpet-cleaning': ['cleaning'],
  'window-cleaning': ['cleaning'],
  'pool-maintenance': ['cleaning'],
}

const getCachedServiceAggregateRating = unstable_cache(
  async (serviceSlug: string): Promise<ServiceAggregateRating | null> => {
    const categories = SERVICE_CATEGORY_MAP[serviceSlug]
    if (!categories?.length) return null

    try {
      let jobsSnap
      try {
        jobsSnap = await adminDb
          .collection('jobs')
          .where('category', 'in', categories)
          .where('status', '==', 'completed')
          .limit(400)
          .get()
      } catch (error) {
        console.warn('[serviceRatings] Falling back to category-only query:', error)
        jobsSnap = await adminDb
          .collection('jobs')
          .where('category', 'in', categories)
          .limit(400)
          .get()
      }

      const completedJobIds = jobsSnap.docs
        .filter((doc) => doc.data()?.status === 'completed')
        .map((doc) => doc.id)

      if (completedJobIds.length === 0) return null

      let ratingSum = 0
      let reviewCount = 0

      const reviewChunks = Array.from(
        { length: Math.ceil(completedJobIds.length / 30) },
        (_, index) => completedJobIds.slice(index * 30, index * 30 + 30)
      )

      const reviewSnaps = await Promise.all(
        reviewChunks.map((jobIdChunk) =>
          adminDb.collection('reviews').where('jobId', 'in', jobIdChunk).get()
        )
      )

      for (const reviewsSnap of reviewSnaps) {
        for (const reviewDoc of reviewsSnap.docs) {
          const review = reviewDoc.data()
          const moderationStatus = review?.moderationStatus
          if (moderationStatus && moderationStatus !== 'approved') continue

          const rating = review?.rating
          if (typeof rating !== 'number' || Number.isNaN(rating)) continue

          ratingSum += rating
          reviewCount += 1
        }
      }

      if (reviewCount === 0) return null

      return {
        ratingValue: Math.round((ratingSum / reviewCount) * 10) / 10,
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      }
    } catch (error) {
      console.error('[serviceRatings] Failed to load aggregate rating:', error)
      return null
    }
  },
  ['service-aggregate-rating'],
  { revalidate: 3600 }
)

export async function getServiceAggregateRating(serviceSlug: string) {
  return getCachedServiceAggregateRating(serviceSlug)
}
