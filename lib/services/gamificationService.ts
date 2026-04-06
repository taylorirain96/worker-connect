import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
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
  totalPoints: number
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
  ten_jobs: { label: 'Experienced', icon: '🏅', description: 'Completed 10 jobs' },
  perfect_rating: { label: 'Top Rated', icon: '⭐', description: 'Maintained a 5.0 rating' },
  speed_worker: { label: 'Speed Worker', icon: '⚡', description: 'Completed a job within 24 hours' },
  verified_id: { label: 'ID Verified', icon: '✅', description: 'Identity has been verified' },
}

export async function awardPoints(
  userId: string,
  points: number,
  // reason is reserved for future analytics / audit-log use
  reason: string
): Promise<void> {
  void reason
  if (!db) return
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
}

export async function getBadges(userId: string): Promise<string[]> {
  if (!db) return []
  const statsRef = doc(db, 'userStats', userId)
  const snapshot = await getDoc(statsRef)
  if (!snapshot.exists()) return []
  return (snapshot.data()?.badges as string[]) ?? []
}

export async function awardBadge(userId: string, badgeId: string): Promise<void> {
  if (!db) return
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
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  if (!db) return null
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

export async function initUserStats(userId: string): Promise<void> {
  if (!db) return
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
}
