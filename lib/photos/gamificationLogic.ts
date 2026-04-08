/**
 * Photo-specific gamification logic.
 * Awards points and badges when workers upload job photos.
 */

import { awardPoints, awardBadge, getBadges } from '@/lib/services/gamificationService'
import { getWorkerPhotos } from '@/lib/photos/firebase'

export const PHOTO_POINTS_BASE = 25          // +25 for uploading ≥2 photos on a job
export const PHOTO_COMPLETION_BONUS = 50     // +50 for 100% photo completion (all jobs)
export const PHOTO_QUICK_MULTIPLIER = 1.5    // 1.5× multiplier if uploaded within 24 h of job completion
export const PHOTO_MASTER_THRESHOLD = 50     // badge: Photo Master
export const DETAIL_ORIENTED_AVG = 5         // badge: Detail Oriented (avg ≥5 photos/job)

export interface PhotoGamificationResult {
  pointsAwarded: number
  badgesAwarded: string[]
}

/**
 * Award points and check badge eligibility after a worker uploads photos for a job.
 *
 * @param workerId          Worker UID
 * @param jobCompletedAt    ISO timestamp when the job was marked complete (for time bonus)
 * @param photoCount        Number of photos uploaded for this specific job
 */
export async function awardPhotoPoints(
  workerId: string,
  jobCompletedAt: string | null,
  photoCount: number
): Promise<PhotoGamificationResult> {
  const result: PhotoGamificationResult = { pointsAwarded: 0, badgesAwarded: [] }

  if (photoCount < 2) return result

  // Base points
  let points = PHOTO_POINTS_BASE

  // Time-based multiplier: 1.5× if uploaded within 24 hours of job completion
  if (jobCompletedAt) {
    const completedAt = new Date(jobCompletedAt).getTime()
    const now = Date.now()
    const hoursElapsed = (now - completedAt) / (1000 * 60 * 60)
    if (hoursElapsed <= 24) {
      points = Math.round(points * PHOTO_QUICK_MULTIPLIER)
    }
  }

  await awardPoints(workerId, points, 'photo_upload')
  result.pointsAwarded = points

  // Check badge eligibility
  const [existingBadges, allPhotos] = await Promise.all([
    getBadges(workerId),
    getWorkerPhotos(workerId, 500),
  ])

  const totalPhotos = allPhotos.length

  // Photo Master badge: 50+ photos total
  if (totalPhotos >= PHOTO_MASTER_THRESHOLD && !existingBadges.includes('photo_master')) {
    await awardBadge(workerId, 'photo_master')
    result.badgesAwarded.push('photo_master')
  }

  // Detail Oriented badge: average ≥5 photos per job
  const jobIds = new Set(allPhotos.map((p) => p.jobId))
  const avgPhotosPerJob = jobIds.size > 0 ? totalPhotos / jobIds.size : 0
  if (avgPhotosPerJob >= DETAIL_ORIENTED_AVG && !existingBadges.includes('detail_oriented')) {
    await awardBadge(workerId, 'detail_oriented')
    result.badgesAwarded.push('detail_oriented')
  }

  return result
}
