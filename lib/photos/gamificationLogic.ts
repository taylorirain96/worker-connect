import { awardPoints, awardBadge, getBadges } from '@/lib/services/gamificationService'

/** Milliseconds per hour — used for early-upload bonus calculation */
const MS_PER_HOUR = 1000 * 60 * 60

export const PHOTO_POINTS = {
  uploadTwoOrMore: 25,
  fullCompletionBonus: 50,
  earlyUploadMultiplier: 1.5, // within 24 hours of job completion
} as const

export const PHOTO_BADGES = {
  photoMaster: 'photo_master',      // 50+ photos uploaded
  detailOriented: 'detail_oriented', // 5+ photos per job average
} as const

/** Award +25 points when a worker uploads 2 or more photos for a job.
 *  Applies a 1.5× multiplier when photos are uploaded within 24 hours.
 */
export async function awardPhotoUploadPoints(
  workerId: string,
  jobCompletedAt: string,
  photoCount: number
): Promise<void> {
  if (photoCount < 2) return

  const completedMs = new Date(jobCompletedAt).getTime()
  const now = Date.now()
  const hoursElapsed = (now - completedMs) / MS_PER_HOUR
  const isEarly = hoursElapsed <= 24

  const basePoints = PHOTO_POINTS.uploadTwoOrMore
  const points = isEarly
    ? Math.round(basePoints * PHOTO_POINTS.earlyUploadMultiplier)
    : basePoints

  const reason = isEarly
    ? `Photo upload within 24h (${photoCount} photos) — ${points} pts`
    : `Photo upload (${photoCount} photos) — ${points} pts`

  await awardPoints(workerId, points, reason)
}

/** Award the "Photo Master" badge when total photos reach 50 */
export async function checkAndAwardPhotoMasterBadge(
  workerId: string,
  totalPhotos: number
): Promise<void> {
  if (totalPhotos < 50) return
  const badges = await getBadges(workerId)
  if (!badges.includes(PHOTO_BADGES.photoMaster)) {
    await awardBadge(workerId, PHOTO_BADGES.photoMaster)
  }
}

/** Award the "Detail Oriented" badge when average photos/job reaches 5 */
export async function checkAndAwardDetailOrientedBadge(
  workerId: string,
  totalPhotos: number,
  jobsWithPhotos: number
): Promise<void> {
  if (jobsWithPhotos === 0) return
  const avg = totalPhotos / jobsWithPhotos
  if (avg < 5) return
  const badges = await getBadges(workerId)
  if (!badges.includes(PHOTO_BADGES.detailOriented)) {
    await awardBadge(workerId, PHOTO_BADGES.detailOriented)
  }
}
