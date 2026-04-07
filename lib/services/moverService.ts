/**
 * Mover service — Firestore helpers for relocation-mode workers.
 */
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Job } from '@/types'
import type { MoverSettings, MoverLeaderboardEntry } from '@/types/reputation'

// ─── Collection names ────────────────────────────────────────────────────────

const MOVER_SETTINGS_COL = 'moverSettings'
const JOBS_COL = 'jobs'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function defaultSettings(workerId: string): MoverSettings {
  return {
    workerId,
    targetRelocationCity: null,
    relocationReadiness: 0,
    isActive: false,
    jobTypePreferences: [],
    relocationAcceptanceRate: 0,
    relocationSuccessRate: 0,
    repeatClientRate: 0,
  }
}

function docToSettings(id: string, data: Record<string, unknown>): MoverSettings {
  return {
    workerId: id,
    targetRelocationCity: (data.targetRelocationCity as string | null) ?? null,
    relocationReadiness: (data.relocationReadiness as number) ?? 0,
    isActive: (data.isActive as boolean) ?? false,
    jobTypePreferences: (data.jobTypePreferences as string[]) ?? [],
    relocationAcceptanceRate: (data.relocationAcceptanceRate as number) ?? 0,
    relocationSuccessRate: (data.relocationSuccessRate as number) ?? 0,
    repeatClientRate: (data.repeatClientRate as number) ?? 0,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch mover settings for a worker, returning defaults if none exist. */
export async function getMoverSettings(workerId: string): Promise<MoverSettings> {
  if (!db) return defaultSettings(workerId)
  const snap = await getDoc(doc(db, MOVER_SETTINGS_COL, workerId))
  if (!snap.exists()) return defaultSettings(workerId)
  return docToSettings(snap.id, snap.data() as Record<string, unknown>)
}

/** Upsert mover settings for a worker. */
export async function updateMoverSettings(
  workerId: string,
  settings: Partial<Omit<MoverSettings, 'workerId'>>
): Promise<MoverSettings> {
  if (!db) return { ...defaultSettings(workerId), ...settings }

  const existing = await getMoverSettings(workerId)
  const updated: MoverSettings = { ...existing, ...settings, workerId }

  await setDoc(doc(db, MOVER_SETTINGS_COL, workerId), {
    ...updated,
    updatedAt: new Date(),
  })

  return updated
}

/** Check whether a worker is currently relocation-ready. */
export async function isRelocationReady(workerId: string): Promise<boolean> {
  const settings = await getMoverSettings(workerId)
  const { targetRelocationCity, relocationReadiness } = settings
  return (
    targetRelocationCity !== null &&
    targetRelocationCity.trim().length > 0 &&
    relocationReadiness >= 80
  )
}

/** Return the top `n` mover workers sorted by relocationSuccessRate descending. */
export async function getMoverLeaderboard(n: number = 10): Promise<MoverLeaderboardEntry[]> {
  if (!db) return []

  const q = query(
    collection(db, MOVER_SETTINGS_COL),
    where('isActive', '==', true),
    orderBy('relocationSuccessRate', 'desc'),
    limit(n)
  )
  const snap = await getDocs(q)

  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      workerId: d.id,
      workerName: (data.workerName as string) ?? 'Worker',
      workerAvatar: data.workerAvatar as string | undefined,
      targetRelocationCity: (data.targetRelocationCity as string) ?? '',
      relocationSuccessRate: (data.relocationSuccessRate as number) ?? 0,
      completionRate: (data.completionRate as number) ?? 0,
      reputationScore: (data.reputationScore as number) ?? 0,
    } satisfies MoverLeaderboardEntry
  })
}

/** Return open jobs matching the given city and optional job-type preferences. */
export async function getMoverOpportunities(
  targetCity: string,
  jobTypes: string[] = []
): Promise<(Job & { isPremiumMatch: boolean })[]> {
  if (!db) return []

  const constraints = [
    where('status', '==', 'open'),
    where('location', '==', targetCity),
  ]

  const q = query(collection(db, JOBS_COL), ...constraints, limit(50))
  const snap = await getDocs(q)

  return snap.docs
    .map((d) => {
      const data = d.data() as Record<string, unknown>
      const job = { ...data, id: d.id } as Job
      const isPremiumMatch =
        jobTypes.length > 0 &&
        jobTypes.some((t) =>
          (job.category as string)?.toLowerCase().includes(t.toLowerCase())
        )
      return { ...job, isPremiumMatch }
    })
    .map((job) => {
      const raw = (job as unknown as Record<string, unknown>).createdAt
      if (raw instanceof Timestamp) {
        ;(job as unknown as Record<string, unknown>).createdAt = raw.toDate().toISOString()
      }
      return job
    })
}
