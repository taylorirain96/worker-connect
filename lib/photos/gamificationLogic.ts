/**
 * Points & badge calculations for the Photo Reviews gamification system.
 */

import type { JobPhoto } from '@/types'

// ─── Point values ────────────────────────────────────────────────────────────

export const PHOTO_POINTS = {
  /** Awarded when a worker uploads ≥2 photos for a single job */
  UPLOAD_BONUS: 25,
  /** Awarded when a worker has uploaded photos for every completed job */
  FULL_COMPLETION_BONUS: 50,
  /** Multiplier applied when photos are uploaded within 24 hours of job completion */
  EARLY_UPLOAD_MULTIPLIER: 1.5,
} as const

// ─── Badge definitions ───────────────────────────────────────────────────────

export const PHOTO_BADGE_DEFINITIONS: Record<
  string,
  { id: string; label: string; icon: string; description: string }
> = {
  photo_master: {
    id: 'photo_master',
    label: 'Photo Master',
    icon: '📸',
    description: 'Uploaded 50+ photos across all jobs',
  },
  detail_oriented: {
    id: 'detail_oriented',
    label: 'Detail Oriented',
    icon: '🔍',
    description: 'Averaged 5+ photos per job',
  },
  most_documented: {
    id: 'most_documented',
    label: 'Most Documented',
    icon: '🏆',
    description: 'Top-ranked worker for photo documentation',
  },
}

// ─── Calculate points for uploading photos for one job ───────────────────────

export function calculateUploadPoints(
  photoCount: number,
  jobCompletedAt: string | null,
  uploadedAt: Date = new Date()
): number {
  if (photoCount < 2) return 0

  let points: number = PHOTO_POINTS.UPLOAD_BONUS

  if (jobCompletedAt) {
    const completedMs = new Date(jobCompletedAt).getTime()
    const uploadMs = uploadedAt.getTime()
    const hoursElapsed = (uploadMs - completedMs) / (1000 * 60 * 60)
    if (hoursElapsed <= 24) {
      points = Math.round(points * PHOTO_POINTS.EARLY_UPLOAD_MULTIPLIER)
    }
  }

  return points
}

// ─── Determine which badges a worker has earned ──────────────────────────────

export function computePhotoBadges(
  photos: JobPhoto[],
  totalCompletedJobs: number
): string[] {
  const badges: string[] = []

  if (photos.length >= 50) badges.push('photo_master')

  if (totalCompletedJobs > 0) {
    const jobIdSet = new Set<string>()
    photos.forEach((p) => jobIdSet.add(p.jobId))
    const avgPhotosPerJob = photos.length / jobIdSet.size
    if (avgPhotosPerJob >= 5) badges.push('detail_oriented')
  }

  return badges
}

// ─── Calculate photo completion rate ─────────────────────────────────────────

export function photoCompletionRate(
  jobsWithPhotos: number,
  totalCompletedJobs: number
): number {
  if (totalCompletedJobs === 0) return 0
  return Math.round((jobsWithPhotos / totalCompletedJobs) * 100)
}
