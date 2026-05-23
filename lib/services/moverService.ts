import { db } from '@/lib/firebase'
import { adminDb } from '@/lib/firebase-admin'
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore'
import type { MoverSettings, MoverLeaderboardEntry, MoverOpportunity, MoverStats } from '@/types/reputation'

export async function getMoverSettings(workerId: string): Promise<MoverSettings | null> {
  if (!db) return null
  try {
    const ref = doc(db, 'moverSettings', workerId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as MoverSettings
  } catch {
    return null
  }
}

export async function updateMoverSettings(workerId: string, settings: Partial<MoverSettings>): Promise<MoverSettings> {
  if (!db) throw new Error('Firestore not initialized')
  const existing = await getMoverSettings(workerId)
  const updated: MoverSettings = {
    workerId,
    targetRelocationCity: '',
    relocationReadiness: 0,
    isActive: false,
    relocationAcceptanceRate: 0,
    relocationSuccessRate: 0,
    repeatClientRate: 0,
    hasRelocationBadge: false,
    willingToRelocate: false,
    fifoAvailable: false,
    targetCountries: [],
    workRightsNZ: false,
    workRightsAU: false,
    accommodationRequired: false,
    travelAssistanceRequired: false,
    relocationPreference: 'either',
    ...existing,
    ...settings,
  }
  const ref = doc(db, 'moverSettings', workerId)
  await setDoc(ref, updated)
  return updated
}

export async function getMoverOpportunities(targetCity: string): Promise<MoverOpportunity[]> {
  const target = (targetCity ?? '').toLowerCase().trim()
  if (!target) return []

  try {
    const snap = await adminDb
      .collection('jobs')
      .where('status', '==', 'open')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()

    const urgencyRank: Record<string, number> = { emergency: 0, high: 1, medium: 2, low: 3 }

    return snap.docs
      .map((d) => {
        const j = d.data() as {
          title?: string
          location?: string
          budget?: number
          urgency?: 'low' | 'medium' | 'high' | 'emergency'
          featuredListing?: boolean
          relocationFriendly?: boolean
        }
        const location = (j.location ?? '').toLowerCase()
        const rawUrgency = j.urgency ?? 'medium'
        const normalisedUrgency: MoverOpportunity['urgency'] =
          rawUrgency === 'emergency' ? 'high' : (rawUrgency as MoverOpportunity['urgency'])
        const relocationFriendly = Boolean(j.relocationFriendly)
        const locationMatch = location.includes(target)
        return {
          jobId: d.id,
          title: j.title ?? 'Untitled job',
          location: j.location ?? '',
          budget: Number(j.budget ?? 0),
          urgency: normalisedUrgency,
          distance: 0,
          premiumMatch:
            relocationFriendly ||
            Boolean(j.featuredListing) ||
            rawUrgency === 'high' ||
            rawUrgency === 'emergency',
          // Surface a job if it matches the target city OR the employer
          // explicitly flagged it relocation-friendly (open to movers).
          _include: locationMatch || relocationFriendly,
          // Prefer location matches over generic relocation-friendly posts when sorting.
          _matchRank: locationMatch ? 0 : 1,
          _urgencyRank: urgencyRank[rawUrgency] ?? 2,
        }
      })
      .filter((j) => j._include)
      .sort(
        (a, b) =>
          a._matchRank - b._matchRank ||
          a._urgencyRank - b._urgencyRank ||
          b.budget - a.budget
      )
      .slice(0, 20)
      .map(({ _include: _i, _matchRank: _mr, _urgencyRank: _ur, ...rest }) => rest)
  } catch (err) {
    console.error('getMoverOpportunities error:', err)
    return []
  }
}

export async function getMoverLeaderboard(limit: number = 10): Promise<MoverLeaderboardEntry[]> {
  if (!db) return []
  try {
    const q = query(collection(db, 'moverSettings'), orderBy('relocationSuccessRate', 'desc'), firestoreLimit(limit))
    const snap = await getDocs(q)
    return snap.docs.map((d, i) => {
      const data = d.data() as MoverSettings & { name?: string; avatar?: string; completionRate?: number }
      return {
        workerId: data.workerId,
        name: data.name || 'Worker',
        avatar: data.avatar,
        targetRelocationCity: data.targetRelocationCity,
        relocationSuccessRate: data.relocationSuccessRate,
        completionRate: data.completionRate || 0,
        rank: i + 1,
      }
    })
  } catch {
    return []
  }
}

export async function getMoverStats(): Promise<MoverStats> {
  const empty: MoverStats = {
    totalMoverWorkers: 0,
    avgRelocationSuccessRate: 0,
    topCities: [],
    monthlyStats: [],
  }

  try {
    const moverSnap = await adminDb
      .collection('moverSettings')
      .where('isActive', '==', true)
      .get()
    const active = moverSnap.docs.map((d) => d.data() as MoverSettings)
    const totalMoverWorkers = active.length
    const avgRelocationSuccessRate = totalMoverWorkers
      ? Math.round(
          active.reduce((sum, s) => sum + (Number(s.relocationSuccessRate) || 0), 0) /
            totalMoverWorkers
        )
      : 0

    const cityCounts: Record<string, number> = {}
    for (const s of active) {
      const city = (s.targetRelocationCity ?? '').trim()
      if (city) cityCounts[city] = (cityCounts[city] ?? 0) + 1
    }
    const topCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([city]) => city)

    // Last 3 calendar months (oldest first)
    const now = new Date()
    const months = [2, 1, 0].map((i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      return {
        label: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        placements: 0,
        rateSum: 0,
        rateCount: 0,
      }
    })

    const activeById = new Map(active.map((s) => [s.workerId, s]))
    if (activeById.size > 0) {
      // Fetch recent completed jobs without a composite index requirement; filter in-memory.
      const jobsSnap = await adminDb
        .collection('jobs')
        .where('status', '==', 'completed')
        .limit(500)
        .get()

      const earliestMs = new Date(months[0].year, months[0].month, 1).getTime()
      for (const doc of jobsSnap.docs) {
        const j = doc.data() as {
          assignedWorkerId?: string
          completedAt?: string | { toDate?: () => Date }
        }
        const workerId = j.assignedWorkerId
        const setting = workerId ? activeById.get(workerId) : undefined
        if (!setting || !j.completedAt) continue
        const dt =
          typeof j.completedAt === 'object' && typeof j.completedAt.toDate === 'function'
            ? j.completedAt.toDate()
            : new Date(j.completedAt as string)
        if (Number.isNaN(dt.getTime()) || dt.getTime() < earliestMs) continue
        const bucket = months.find((m) => m.year === dt.getFullYear() && m.month === dt.getMonth())
        if (!bucket) continue
        bucket.placements += 1
        bucket.rateSum += Number(setting.relocationSuccessRate) || 0
        bucket.rateCount += 1
      }
    }

    return {
      totalMoverWorkers,
      avgRelocationSuccessRate,
      topCities,
      monthlyStats: months.map((m) => ({
        month: m.label,
        placements: m.placements,
        avgSuccessRate: m.rateCount ? Math.round(m.rateSum / m.rateCount) : 0,
      })),
    }
  } catch (err) {
    console.error('getMoverStats error:', err)
    return empty
  }
}

export function calculateRelocationBadge(_workerId: string, completionRate: number, targetCity: string): boolean {
  return Boolean(targetCity) && completionRate >= 80
}
