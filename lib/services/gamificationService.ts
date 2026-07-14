import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  setDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserStats } from '@/types'

export type WorkerLevel = 'bronze' | 'silver' | 'gold' | 'platinum'

const LEVEL_THRESHOLDS: Record<WorkerLevel, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
}

export function calculateWorkerLevel(totalPoints: number): WorkerLevel {
  if (totalPoints >= LEVEL_THRESHOLDS.platinum) return 'platinum'
  if (totalPoints >= LEVEL_THRESHOLDS.gold) return 'gold'
  if (totalPoints >= LEVEL_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

export function pointsToNextLevel(
  totalPoints: number,
): { next: WorkerLevel; remaining: number; currentThreshold: number; nextThreshold: number } | null {
  if (totalPoints >= LEVEL_THRESHOLDS.platinum) return null
  if (totalPoints >= LEVEL_THRESHOLDS.gold) {
    return {
      next: 'platinum',
      remaining: LEVEL_THRESHOLDS.platinum - totalPoints,
      currentThreshold: LEVEL_THRESHOLDS.gold,
      nextThreshold: LEVEL_THRESHOLDS.platinum,
    }
  }
  if (totalPoints >= LEVEL_THRESHOLDS.silver) {
    return {
      next: 'gold',
      remaining: LEVEL_THRESHOLDS.gold - totalPoints,
      currentThreshold: LEVEL_THRESHOLDS.silver,
      nextThreshold: LEVEL_THRESHOLDS.gold,
    }
  }
  return {
    next: 'silver',
    remaining: LEVEL_THRESHOLDS.silver - totalPoints,
    currentThreshold: LEVEL_THRESHOLDS.bronze,
    nextThreshold: LEVEL_THRESHOLDS.silver,
  }
}

export const LEVEL_ICONS: Record<WorkerLevel, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
}

export const BADGE_DEFINITIONS: Record<string, { label: string; icon: string; description: string }> = {
  first_job: { label: 'First Job', icon: '🎉', description: 'Completed your first job' },
  five_jobs: { label: 'Rising Star', icon: '⭐', description: 'Completed 5 jobs' },
  ten_jobs: { label: '10 Jobs', icon: '🎯', description: 'Completed 10 jobs' },
  fifty_jobs: { label: '50 Jobs', icon: '💼', description: 'Completed 50 jobs' },
  perfect_rating: { label: 'Top Rated', icon: '⭐', description: 'Maintained a 5.0 rating' },
  speed_worker: { label: 'Speed Worker', icon: '⚡', description: 'Completed a job within 24 hours' },
  verified_id: { label: 'ID Verified', icon: '✅', description: 'Identity has been verified' },
  high_value: { label: 'High Value', icon: '💎', description: 'Completed a $5,000+ job' },
  consistent: { label: 'Consistent', icon: '🔄', description: 'Completed at least 1 job every 30 days for 3 straight months' },
  trusted: { label: 'Trusted', icon: '⭐', description: 'Completed 5 jobs rated 4.5+ stars' },
  big_earner: { label: 'Big Earner', icon: '💰', description: 'Earned $5,000+ in a rolling 30-day window' },
  // Leaderboard badges
  weekly_champion: { label: 'Champion', icon: '🥇', description: 'Ranked #1 on the weekly leaderboard' },
  weekly_runner_up: { label: 'Runner-up', icon: '🥈', description: 'Ranked #2 on the weekly leaderboard' },
  weekly_rising_star: { label: 'Rising Star', icon: '🥉', description: 'Ranked #3 on the weekly leaderboard' },
  top_10: { label: 'Top 10', icon: '🏆', description: 'Entered the weekly top 10' },
  // Photo badges
  photo_master: { label: 'Photo Master', icon: '📸', description: 'Uploaded 50+ job photos' },
  detail_oriented: { label: 'Detail Oriented', icon: '🔍', description: 'Averaged 5+ photos per job' },
  // Review badges
  highly_rated: { label: 'Highly Rated', icon: '⭐', description: 'Maintained a 4.5+ average rating with 5+ reviews' },
  customer_favorite: { label: 'Customer Favorite', icon: '❤️', description: 'Received 50+ reviews' },
  responsive_pro: { label: 'Responsive Pro', icon: '💬', description: 'Responded to 90%+ of reviews' },
}

async function getAdminGamificationHelpers() {
  if (typeof window !== 'undefined') return null

  const [{ adminDb }, { FieldValue }] = await Promise.all([
    import('@/lib/firebase-admin'),
    import('firebase-admin/firestore'),
  ])

  return { adminDb, FieldValue }
}

export async function awardPoints(
  userId: string,
  points: number,
  reason: string,
): Promise<void> {
  void reason

  if (db) {
    const statsRef = doc(db, 'userStats', userId)
    const snapshot = await getDoc(statsRef)
    if (snapshot.exists()) {
      await updateDoc(statsRef, {
        weeklyPoints: increment(points),
        allTimePoints: increment(points),
        updatedAt: serverTimestamp(),
      })
    } else {
      await setDoc(statsRef, {
        completedJobs: 0,
        totalEarnings: 0,
        weeklyPoints: points,
        allTimePoints: points,
        badges: [],
        verified: { id: false, responded: false, reviews: false },
        updatedAt: serverTimestamp(),
      })
    }
    return
  }

  const adminHelpers = await getAdminGamificationHelpers()
  if (!adminHelpers?.adminDb) return

  const { adminDb, FieldValue } = adminHelpers
  const statsRef = adminDb.collection('userStats').doc(userId)
  const snapshot = await statsRef.get()
  if (snapshot.exists) {
    await statsRef.set({
      weeklyPoints: FieldValue.increment(points),
      allTimePoints: FieldValue.increment(points),
      updatedAt: new Date().toISOString(),
    }, { merge: true })
    return
  }

  await statsRef.set({
    completedJobs: 0,
    totalEarnings: 0,
    weeklyPoints: points,
    allTimePoints: points,
    badges: [],
    verified: { id: false, responded: false, reviews: false },
    updatedAt: new Date().toISOString(),
  })
}

export async function getBadges(userId: string): Promise<string[]> {
  if (db) {
    const statsRef = doc(db, 'userStats', userId)
    const snapshot = await getDoc(statsRef)
    if (!snapshot.exists()) return []
    return (snapshot.data()?.badges as string[]) ?? []
  }

  const adminHelpers = await getAdminGamificationHelpers()
  if (!adminHelpers?.adminDb) return []

  const snapshot = await adminHelpers.adminDb.collection('userStats').doc(userId).get()
  if (!snapshot.exists) return []
  return (snapshot.data()?.badges as string[]) ?? []
}

export async function awardBadge(userId: string, badgeId: string): Promise<void> {
  if (db) {
    const statsRef = doc(db, 'userStats', userId)
    const snapshot = await getDoc(statsRef)
    if (snapshot.exists()) {
      const current: string[] = snapshot.data()?.badges ?? []
      if (!current.includes(badgeId)) {
        await updateDoc(statsRef, {
          badges: arrayUnion(badgeId),
          updatedAt: serverTimestamp(),
        })
      }
    } else {
      await setDoc(statsRef, {
        completedJobs: 0,
        totalEarnings: 0,
        weeklyPoints: 0,
        allTimePoints: 0,
        badges: [badgeId],
        verified: { id: false, responded: false, reviews: false },
        updatedAt: serverTimestamp(),
      })
    }
    return
  }

  const adminHelpers = await getAdminGamificationHelpers()
  if (!adminHelpers?.adminDb) return

  const { adminDb } = adminHelpers
  const statsRef = adminDb.collection('userStats').doc(userId)
  const snapshot = await statsRef.get()
  if (snapshot.exists) {
    const current: string[] = snapshot.data()?.badges ?? []
    if (!current.includes(badgeId)) {
      await statsRef.set({
        badges: [...current, badgeId],
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    }
    return
  }

  await statsRef.set({
    completedJobs: 0,
    totalEarnings: 0,
    weeklyPoints: 0,
    allTimePoints: 0,
    badges: [badgeId],
    verified: { id: false, responded: false, reviews: false },
    updatedAt: new Date().toISOString(),
  })
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  if (db) {
    const statsRef = doc(db, 'userStats', userId)
    const snapshot = await getDoc(statsRef)
    if (!snapshot.exists()) return null
    const data = snapshot.data()
    return {
      completedJobs: data.completedJobs ?? 0,
      totalEarnings: data.totalEarnings ?? 0,
      weeklyPoints: data.weeklyPoints ?? 0,
      allTimePoints: data.allTimePoints ?? 0,
      badges: data.badges ?? [],
      verified: data.verified ?? { id: false, responded: false, reviews: false },
    }
  }

  const adminHelpers = await getAdminGamificationHelpers()
  if (!adminHelpers?.adminDb) return null

  const snapshot = await adminHelpers.adminDb.collection('userStats').doc(userId).get()
  if (!snapshot.exists) return null
  const data = snapshot.data() ?? {}
  return {
    completedJobs: data.completedJobs ?? 0,
    totalEarnings: data.totalEarnings ?? 0,
    weeklyPoints: data.weeklyPoints ?? 0,
    allTimePoints: data.allTimePoints ?? 0,
    badges: data.badges ?? [],
    verified: data.verified ?? { id: false, responded: false, reviews: false },
  }
}

export async function initUserStats(userId: string): Promise<void> {
  if (db) {
    const statsRef = doc(db, 'userStats', userId)
    const snapshot = await getDoc(statsRef)
    if (!snapshot.exists()) {
      await setDoc(statsRef, {
        completedJobs: 0,
        totalEarnings: 0,
        weeklyPoints: 0,
        allTimePoints: 0,
        badges: [],
        verified: { id: false, responded: false, reviews: false },
        updatedAt: serverTimestamp(),
      })
    }
    return
  }

  const adminHelpers = await getAdminGamificationHelpers()
  if (!adminHelpers?.adminDb) return

  const statsRef = adminHelpers.adminDb.collection('userStats').doc(userId)
  const snapshot = await statsRef.get()
  if (!snapshot.exists) {
    await statsRef.set({
      completedJobs: 0,
      totalEarnings: 0,
      weeklyPoints: 0,
      allTimePoints: 0,
      badges: [],
      verified: { id: false, responded: false, reviews: false },
      updatedAt: new Date().toISOString(),
    })
  }
}
