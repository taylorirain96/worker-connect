import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { awardBadge, awardPoints } from '@/lib/services/gamificationService'
import {
  getWeekId,
  assignRanks,
  getBonusForRank,
} from './rankingLogic'
import { saveWeeklySnapshot, getWeeklyLeaderboard } from './firebase'
import type { JobCategory } from '@/types'

const WEEKLY_STATS_COLLECTION = 'weeklyStats'
const CATEGORIES: (JobCategory | 'all')[] = [
  'all', 'electrical', 'plumbing', 'hvac', 'carpentry', 'roofing',
  'landscaping', 'painting', 'flooring', 'cleaning', 'moving', 'general',
]

/**
 * Executes the weekly leaderboard reset:
 * 1. Snapshots all category leaderboards for the current week.
 * 2. Awards bonus points and badges to the top 3 in each category.
 * 3. Clears the weekly stats ready for the new week.
 *
 * Should be called via a Firebase scheduled function or API route.
 */
export async function runWeeklyReset(): Promise<{ success: boolean; message: string }> {
  if (!db) return { success: false, message: 'Firebase not configured' }

  try {
    const weekId = getWeekId()

    for (const category of CATEGORIES) {
      // 1. Snapshot
      const entries = await getWeeklyLeaderboard(category, 50)
      if (entries.length > 0) {
        await saveWeeklySnapshot(entries, category)
      }

      // 2. Award bonuses to top 3
      for (const entry of entries.slice(0, 3)) {
        const bonus = getBonusForRank(entry.rank)
        if (!bonus) continue
        await awardPoints(entry.userId, bonus.bonusPoints, `Weekly leaderboard #${entry.rank} bonus — week ${weekId}`)
        await awardBadge(entry.userId, bonus.badgeId)
      }
    }

    // 3. Clear weekly stats for the old week
    await clearWeeklyStats(weekId)

    return { success: true, message: `Weekly reset completed for week ${weekId}` }
  } catch (error) {
    console.error('Weekly reset failed:', error)
    return { success: false, message: String(error) }
  }
}

/**
 * Removes all weekly-stats documents for the given week.
 */
async function clearWeeklyStats(weekId: string): Promise<void> {
  if (!db) return
  const q = query(collection(db, WEEKLY_STATS_COLLECTION), where('weekId', '==', weekId))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

/**
 * Recomputes and returns the live ranked leaderboard for all categories.
 * Useful to call after a point award to show updated ranks.
 */
export async function refreshLeaderboard(category: JobCategory | 'all' = 'all') {
  if (!db) return []
  const weekId = getWeekId()

  const q = query(
    collection(db, WEEKLY_STATS_COLLECTION),
    where('weekId', '==', weekId)
  )
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

  const filtered = category === 'all' ? raw : raw.filter((e) => e.category === category)
  const ranked = assignRanks(filtered)

  // Persist snapshot
  await saveWeeklySnapshot(ranked, category)

  return ranked
}

/**
 * Increments a worker's weekly points in their weekly stats document.
 * Call this after any points-awarding action during the week.
 */
export async function addWeeklyPoints(
  userId: string,
  points: number
): Promise<void> {
  if (!db) return
  const weekId = getWeekId()
  const ref = doc(db, WEEKLY_STATS_COLLECTION, `${weekId}-${userId}`)
  await updateDoc(ref, {
    weeklyPoints: increment(points),
    updatedAt: serverTimestamp(),
  }).catch((err) => {
    console.warn('addWeeklyPoints: document not found, will be initialised on next stat update', err)
  })
}
