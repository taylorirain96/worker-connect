import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { JobCategory } from '@/types'
import {
  LeaderboardEntry,
  WeeklySnapshot,
  getWeekId,
  getWeekBounds,
  assignRanks,
} from './rankingLogic'

const LEADERBOARD_COLLECTION = 'leaderboard'
const WEEKLY_STATS_COLLECTION = 'weeklyStats'

/**
 * Fetches the current week's leaderboard for a given category (or overall).
 */
export async function getWeeklyLeaderboard(
  category: JobCategory | 'all' = 'all',
  topN = 10
): Promise<LeaderboardEntry[]> {
  if (!db) return getMockLeaderboard(category, topN)

  try {
    const weekId = getWeekId()
    const docId = category === 'all' ? `${weekId}-all` : `${weekId}-${category}`
    const snapshotRef = doc(db, LEADERBOARD_COLLECTION, docId)
    const snapshot = await getDoc(snapshotRef)
    if (snapshot.exists()) {
      const data = snapshot.data() as WeeklySnapshot
      return data.entries.slice(0, topN)
    }

    // Fall back to computing from weeklyStats
    return await computeLeaderboardFromStats(category, topN)
  } catch {
    return getMockLeaderboard(category, topN)
  }
}

/**
 * Fetches leaderboard entries from userWeeklyStats collection.
 */
async function computeLeaderboardFromStats(
  category: JobCategory | 'all',
  topN: number
): Promise<LeaderboardEntry[]> {
  if (!db) return []
  const weekId = getWeekId()

  let q = query(
    collection(db, WEEKLY_STATS_COLLECTION),
    where('weekId', '==', weekId),
    orderBy('weeklyPoints', 'desc'),
    limit(topN)
  )
  if (category !== 'all') {
    q = query(
      collection(db, WEEKLY_STATS_COLLECTION),
      where('weekId', '==', weekId),
      where('category', '==', category),
      orderBy('weeklyPoints', 'desc'),
      limit(topN)
    )
  }

  const snap = await getDocs(q)
  const raw = snap.docs.map((d) => ({
    userId: d.data().userId as string,
    displayName: d.data().displayName as string,
    photoURL: d.data().photoURL as string | undefined,
    category: d.data().category as JobCategory | undefined,
    weeklyPoints: d.data().weeklyPoints as number,
    jobsCompleted: d.data().jobsCompleted as number,
    rating: d.data().rating as number | undefined,
    badges: d.data().badges as string[] | undefined,
  }))

  return assignRanks(raw)
}

/**
 * Saves a completed weekly snapshot to Firestore (called by weekly reset).
 */
export async function saveWeeklySnapshot(
  entries: LeaderboardEntry[],
  category: JobCategory | 'all' = 'all'
): Promise<void> {
  if (!db) return
  const weekId = getWeekId()
  const { start, end } = getWeekBounds()
  const docId = category === 'all' ? `${weekId}-all` : `${weekId}-${category}`

  const snapshot: WeeklySnapshot = {
    weekId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    entries,
    category,
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, LEADERBOARD_COLLECTION, docId), snapshot)
}

/**
 * Fetches a historical week's snapshot.
 */
export async function getHistoricalLeaderboard(
  weekId: string,
  category: JobCategory | 'all' = 'all'
): Promise<WeeklySnapshot | null> {
  if (!db) return null
  const docId = category === 'all' ? `${weekId}-all` : `${weekId}-${category}`
  const snap = await getDoc(doc(db, LEADERBOARD_COLLECTION, docId))
  if (!snap.exists()) return null
  return snap.data() as WeeklySnapshot
}

/**
 * Updates a worker's weekly stats document.
 */
export async function updateWorkerWeeklyStats(
  userId: string,
  updates: {
    displayName?: string
    photoURL?: string
    category?: JobCategory
    rating?: number
    pointsDelta?: number
    jobsDelta?: number
  }
): Promise<void> {
  if (!db) return
  const weekId = getWeekId()
  const docId = `${weekId}-${userId}`
  const ref = doc(db, WEEKLY_STATS_COLLECTION, docId)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    const up: Record<string, unknown> = { updatedAt: serverTimestamp() }
    if (updates.pointsDelta) up.weeklyPoints = increment(updates.pointsDelta)
    if (updates.jobsDelta) up.jobsCompleted = increment(updates.jobsDelta)
    if (updates.displayName) up.displayName = updates.displayName
    if (updates.photoURL) up.photoURL = updates.photoURL
    if (updates.rating !== undefined) up.rating = updates.rating
    if (updates.category) up.category = updates.category
    await updateDoc(ref, up)
  } else {
    await setDoc(ref, {
      weekId,
      userId,
      displayName: updates.displayName ?? '',
      photoURL: updates.photoURL ?? null,
      category: updates.category ?? null,
      rating: updates.rating ?? null,
      weeklyPoints: updates.pointsDelta ?? 0,
      jobsCompleted: updates.jobsDelta ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

/**
 * Fetches the rank of a specific user in the current week.
 */
export async function getWorkerRank(
  userId: string,
  category: JobCategory | 'all' = 'all'
): Promise<{ rank: number; totalEntries: number; weeklyPoints: number } | null> {
  const entries = await getWeeklyLeaderboard(category, 50)
  const idx = entries.findIndex((e) => e.userId === userId)
  if (idx === -1) return null
  return {
    rank: idx + 1,
    totalEntries: entries.length,
    weeklyPoints: entries[idx].weeklyPoints,
  }
}

// ---------------------------------------------------------------------------
// Mock data (used when Firebase is not configured)
// ---------------------------------------------------------------------------

const MOCK_WORKERS = [
  { userId: 'w1', displayName: 'Marcus Johnson', category: 'electrical' as JobCategory, weeklyPoints: 420, jobsCompleted: 8, rating: 4.9, badges: ['weekly_champion'] },
  { userId: 'w2', displayName: 'Sarah Williams', category: 'plumbing' as JobCategory, weeklyPoints: 380, jobsCompleted: 7, rating: 4.8, badges: ['weekly_runner_up'] },
  { userId: 'w3', displayName: 'James Rodriguez', category: 'hvac' as JobCategory, weeklyPoints: 350, jobsCompleted: 6, rating: 4.7, badges: ['weekly_rising_star'] },
  { userId: 'w4', displayName: 'Emily Chen', category: 'carpentry' as JobCategory, weeklyPoints: 310, jobsCompleted: 5, rating: 4.9, badges: [] },
  { userId: 'w5', displayName: 'David Thompson', category: 'roofing' as JobCategory, weeklyPoints: 280, jobsCompleted: 5, rating: 4.6, badges: [] },
  { userId: 'w6', displayName: 'Lisa Martinez', category: 'painting' as JobCategory, weeklyPoints: 260, jobsCompleted: 4, rating: 4.8, badges: [] },
  { userId: 'w7', displayName: 'Kevin Park', category: 'landscaping' as JobCategory, weeklyPoints: 240, jobsCompleted: 4, rating: 4.5, badges: [] },
  { userId: 'w8', displayName: 'Amanda Foster', category: 'flooring' as JobCategory, weeklyPoints: 210, jobsCompleted: 3, rating: 4.7, badges: [] },
  { userId: 'w9', displayName: 'Robert Kim', category: 'electrical' as JobCategory, weeklyPoints: 190, jobsCompleted: 3, rating: 4.6, badges: [] },
  { userId: 'w10', displayName: 'Jennifer Walsh', category: 'plumbing' as JobCategory, weeklyPoints: 170, jobsCompleted: 3, rating: 4.4, badges: [] },
  { userId: 'w11', displayName: 'Carlos Rivera', category: 'hvac' as JobCategory, weeklyPoints: 150, jobsCompleted: 2, rating: 4.5, badges: [] },
  { userId: 'w12', displayName: 'Michelle Turner', category: 'cleaning' as JobCategory, weeklyPoints: 130, jobsCompleted: 2, rating: 4.3, badges: [] },
]

function getMockLeaderboard(category: JobCategory | 'all', topN: number): LeaderboardEntry[] {
  const filtered = category === 'all'
    ? MOCK_WORKERS
    : MOCK_WORKERS.filter((w) => w.category === category)

  const previousRankMap: Record<string, number> = {
    w1: 2, w2: 1, w3: 3, w4: 5, w5: 4, w6: 7, w7: 6, w8: 8, w9: 10, w10: 9,
    w11: 11, w12: 12,
  }

  return filtered.slice(0, topN).map((w, idx) => {
    const rank = idx + 1
    const prevRank = previousRankMap[w.userId]
    let trend: LeaderboardEntry['trend'] = 'new'
    if (prevRank !== undefined) {
      if (rank < prevRank) trend = 'up'
      else if (rank > prevRank) trend = 'down'
      else trend = 'same'
    }
    return { ...w, rank, previousRank: prevRank, trend, bonusAwarded: rank <= 3 }
  })
}
