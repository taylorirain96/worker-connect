import { ACHIEVEMENT_REWARDS } from '@/lib/gamification/rewards'
import { sendNotification } from '@/lib/notificationService'
import { awardBoosts } from '@/lib/services/boostTrialService'
import { awardBadge } from '@/lib/services/gamificationService'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const NINETY_DAYS_MS = 3 * THIRTY_DAYS_MS
const HIGH_VALUE_THRESHOLD = 5000
const BIG_EARNER_THRESHOLD = 5000

interface CompletedJobRecord {
  id: string
  completedAt: string
  jobValue: number
  workerEarnings: number
}

export interface AchievementMetrics {
  completedJobs: number
  currentJobValue: number
  rolling30DayEarnings: number
  trustedJobs: number
  recentCompletedJobDates: string[]
  awardedAchievements: string[]
}

function normalizeDate(value: string): Date | null {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function hasConsistentCompletionStreak(
  completedJobDates: string[],
  anchorDate: string | Date = new Date(),
): boolean {
  const anchor = anchorDate instanceof Date ? anchorDate : normalizeDate(anchorDate)
  if (!anchor) return false

  const buckets = new Set<number>()
  for (const completedAt of completedJobDates) {
    const parsed = normalizeDate(completedAt)
    if (!parsed) continue

    const age = anchor.getTime() - parsed.getTime()
    if (age < 0 || age > NINETY_DAYS_MS) continue

    const bucket = Math.floor(age / THIRTY_DAYS_MS)
    if (bucket >= 0 && bucket < 3) {
      buckets.add(bucket)
    }
  }

  return buckets.size === 3
}

export function getNewlyEarnedAchievements(metrics: AchievementMetrics) {
  const awarded = new Set(metrics.awardedAchievements)

  return ACHIEVEMENT_REWARDS.filter((achievement) => {
    if (awarded.has(achievement.id)) return false

    switch (achievement.id) {
      case 'ten_jobs':
        return metrics.completedJobs >= 10
      case 'fifty_jobs':
        return metrics.completedJobs >= 50
      case 'high_value':
        return metrics.currentJobValue >= HIGH_VALUE_THRESHOLD
      case 'big_earner':
        return metrics.rolling30DayEarnings >= BIG_EARNER_THRESHOLD
      case 'trusted':
        return metrics.trustedJobs >= 5
      case 'consistent':
        return hasConsistentCompletionStreak(metrics.recentCompletedJobDates)
      default:
        return false
    }
  })
}

export async function checkAndAwardAchievements(workerId: string, jobId: string): Promise<string[]> {
  const { adminDb } = await import('@/lib/firebase-admin')
  if (!adminDb || !workerId) return []

  const userRef = adminDb.collection('users').doc(workerId)
  const userStatsRef = adminDb.collection('userStats').doc(workerId)

  const [userSnap, jobSnap, jobsSnap, escrowsSnap, reviewsSnap] = await Promise.all([
    userRef.get(),
    adminDb.collection('jobs').doc(jobId).get(),
    adminDb.collection('jobs').where('assignedWorkerId', '==', workerId).get(),
    adminDb.collection('escrows').where('workerId', '==', workerId).get(),
    adminDb.collection('reviews').where('revieweeId', '==', workerId).get(),
  ])

  if (!jobSnap.exists) return []

  const jobData = jobSnap.data() ?? {}
  const anchorIso = (jobData.completedAt as string | undefined) ?? new Date().toISOString()
  const anchorDate = new Date(anchorIso)

  const escrowsByJobId = new Map(
    escrowsSnap.docs.map((docSnap) => [docSnap.data().jobId as string, docSnap.data()]),
  )

  const completedJobs: CompletedJobRecord[] = jobsSnap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((job) => job.assignedWorkerId === workerId && job.status === 'completed')
    .map((job) => {
      const escrow = escrowsByJobId.get(job.id)
      const jobValue = Number(escrow?.amount ?? job.budget ?? 0)
      const workerEarnings = Number(
        escrow?.workerReceives ?? escrow?.workerAmount ?? escrow?.amount ?? job.budget ?? 0,
      )
      return {
        id: job.id,
        completedAt: typeof job.completedAt === 'string' ? job.completedAt : anchorIso,
        jobValue,
        workerEarnings,
      }
    })

  const lifetimeEarnings = completedJobs.reduce((sum, job) => sum + job.workerEarnings, 0)
  const rolling30DayEarnings = completedJobs.reduce((sum, job) => {
    const completedAt = normalizeDate(job.completedAt)
    if (!completedAt) return sum

    const age = anchorDate.getTime() - completedAt.getTime()
    if (age < 0 || age > THIRTY_DAYS_MS) return sum
    return sum + job.workerEarnings
  }, 0)

  const currentJob = completedJobs.find((job) => job.id === jobId)
  const currentJobValue = currentJob?.jobValue ?? Number(jobData.budget ?? 0)
  const trustedJobs = reviewsSnap.docs.reduce((count, reviewDoc) => {
    const review = reviewDoc.data()
    if (review.reviewType === 'employer_review') return count
    return Number(review.rating ?? 0) >= 4.5 ? count + 1 : count
  }, 0)

  const awardedAchievements = Array.isArray(userSnap.data()?.awardedAchievements)
    ? (userSnap.data()?.awardedAchievements as string[])
    : []

  const newlyEarned = getNewlyEarnedAchievements({
    completedJobs: completedJobs.length,
    currentJobValue,
    rolling30DayEarnings,
    trustedJobs,
    recentCompletedJobDates: completedJobs.map((job) => job.completedAt),
    awardedAchievements,
  })

  await Promise.all([
    userRef.set({
      completedJobs: completedJobs.length,
      totalEarnings: lifetimeEarnings,
      updatedAt: anchorIso,
    }, { merge: true }),
    userStatsRef.set({
      completedJobs: completedJobs.length,
      totalEarnings: lifetimeEarnings,
      updatedAt: anchorIso,
    }, { merge: true }),
  ])

  const applied = []
  let totalBoosts = 0

  for (const achievement of newlyEarned) {
    const appliedBoosts = await awardBoosts(workerId, achievement.boostReward, {
      reason: `${achievement.label} achievement reward`,
      source: 'achievement',
      jobId,
      badgeId: achievement.badgeId,
      achievementId: achievement.id,
      transactionId: `achievement-${achievement.id}`,
    })

    if (!appliedBoosts) continue

    await awardBadge(workerId, achievement.badgeId)
    applied.push(achievement)
    totalBoosts += achievement.boostReward
  }

  if (totalBoosts > 0) {
    await sendNotification({
      userId: workerId,
      type: 'milestone_reached',
      title: 'Boosts Earned! ⚡',
      message: `You earned ${totalBoosts} Boosts for ${applied.map((achievement) => achievement.label).join(', ')}.`,
      actionUrl: '/dashboard/worker/subscription',
      metadata: {
        jobId,
        boostAmount: totalBoosts,
        achievements: applied.map((achievement) => achievement.id).join(','),
      },
    })
  }

  return applied.map((achievement) => achievement.id)
}
