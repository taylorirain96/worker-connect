import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { MoverModeSettings, MoverStats, MoverLeaderboardEntry } from '@/types/reputation'
import { isRelocationReady } from '@/lib/utils/reputationAlgorithm'

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getMoverSettings(
  userId: string
): Promise<MoverModeSettings | null> {
  if (!db) return null
  const ref = doc(db, 'moverMode', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    userId,
    targetRelocationCity: data.targetRelocationCity ?? '',
    relocationReadiness: data.relocationReadiness ?? 0,
    availableForRelocation: data.availableForRelocation ?? false,
    preferredJobTypes: data.preferredJobTypes ?? [],
    enabledAt: data.enabledAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }
}

export async function getMoverStats(userId: string): Promise<MoverStats | null> {
  if (!db) return null
  const ref = doc(db, 'moverMode', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  const relocationContracts: number = data.relocationContracts ?? 0
  const successfulRelocations: number = data.successfulRelocations ?? 0
  return {
    userId,
    relocationContracts,
    successfulRelocations,
    successRate:
      relocationContracts > 0
        ? Math.round((successfulRelocations / relocationContracts) * 100)
        : 0,
    acceptanceRate: data.acceptanceRate ?? 0,
    repeatClientRate: data.repeatClientRate ?? 0,
    totalRevenueFromRelocation: data.totalRevenueFromRelocation ?? 0,
  }
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export async function setMoverSettings(
  userId: string,
  settings: Pick<
    MoverModeSettings,
    'targetRelocationCity' | 'relocationReadiness' | 'availableForRelocation' | 'preferredJobTypes'
  >
): Promise<MoverModeSettings> {
  if (!db) {
    return {
      userId,
      ...settings,
      enabledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  const ref = doc(db, 'moverMode', userId)
  const snap = await getDoc(ref)
  const now = serverTimestamp()
  if (snap.exists()) {
    await updateDoc(ref, { ...settings, updatedAt: now })
  } else {
    await setDoc(ref, { ...settings, enabledAt: now, updatedAt: now })
  }
  return {
    userId,
    ...settings,
    enabledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ─── Relocation Ready Badge ───────────────────────────────────────────────────

export async function hasRelocationReadyBadge(
  userId: string,
  completionRate: number
): Promise<boolean> {
  const settings = await getMoverSettings(userId)
  return isRelocationReady(settings?.targetRelocationCity, completionRate)
}

// ─── Mover Leaderboard ────────────────────────────────────────────────────────

export async function getMoverLeaderboard(
  topN = 50
): Promise<MoverLeaderboardEntry[]> {
  if (!db) return []
  const ref = collection(db, 'moverMode')
  const q = query(
    ref,
    where('availableForRelocation', '==', true),
    orderBy('relocationContracts', 'desc'),
    limit(topN)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d, index) => {
    const data = d.data()
    const relocationContracts: number = data.relocationContracts ?? 0
    const successfulRelocations: number = data.successfulRelocations ?? 0
    return {
      rank: index + 1,
      userId: d.id,
      displayName: data.displayName ?? 'Worker',
      avatarUrl: data.avatarUrl,
      targetCity: data.targetRelocationCity ?? '',
      successRate:
        relocationContracts > 0
          ? Math.round((successfulRelocations / relocationContracts) * 100)
          : 0,
      completedRelocations: successfulRelocations,
      reputationScore: data.reputationScore ?? 0,
      tier: data.tier ?? 'Rookie',
    }
  })
}
