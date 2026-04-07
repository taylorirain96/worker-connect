import { db } from '@/lib/firebase'
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
    ...existing,
    ...settings,
  }
  const ref = doc(db, 'moverSettings', workerId)
  await setDoc(ref, updated)
  return updated
}

export async function getMoverOpportunities(targetCity: string): Promise<MoverOpportunity[]> {
  return [
    {
      jobId: `opp_${Date.now()}_1`,
      title: 'Residential Move',
      location: targetCity,
      budget: 800,
      urgency: 'high',
      distance: 5,
      premiumMatch: true,
    },
    {
      jobId: `opp_${Date.now()}_2`,
      title: 'Office Relocation',
      location: targetCity,
      budget: 2500,
      urgency: 'medium',
      distance: 12,
      premiumMatch: false,
    },
  ]
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
  return {
    totalMoverWorkers: 0,
    avgRelocationSuccessRate: 0,
    topCities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    monthlyStats: [
      { month: 'Jan', placements: 0, avgSuccessRate: 0 },
      { month: 'Feb', placements: 0, avgSuccessRate: 0 },
      { month: 'Mar', placements: 0, avgSuccessRate: 0 },
    ],
  }
}

export function calculateRelocationBadge(workerId: string, completionRate: number, targetCity: string): boolean {
  return Boolean(targetCity) && completionRate >= 80
}
