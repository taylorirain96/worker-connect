import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { WorkerMoverSettings, MoverLeaderboardEntry } from '@/types/reputation'

const COLLECTION = 'moverSettings'

interface JobOpportunity {
  id: string
  title: string
  city: string
  category: string
  salary: string
  postedAt: string
}

interface MoverStats {
  totalMoverWorkers: number
  averageRelocationSuccessRate: number
  topRelocationCities: string[]
  averageTimeToRelocation: string
  premiumMatchRate: number
}

function toIso(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

const MOCK_SETTINGS: WorkerMoverSettings = {
  workerId: 'mock-worker',
  targetRelocationCity: 'Austin, TX',
  relocationReadiness: 85,
  isRelocationReady: true,
  relocationAcceptanceRate: 90,
  relocationSuccessRate: 88,
  repeatClientRate: 65,
  updatedAt: new Date().toISOString(),
}

export async function getMoverSettings(workerId: string): Promise<WorkerMoverSettings | null> {
  if (!db) return { ...MOCK_SETTINGS, workerId }
  const ref = doc(db, COLLECTION, workerId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    workerId,
    updatedAt: toIso(data.updatedAt),
  } as WorkerMoverSettings
}

export async function updateMoverSettings(workerId: string, settings: Partial<WorkerMoverSettings>): Promise<void> {
  if (!db) return
  const ref = doc(db, COLLECTION, workerId)
  await setDoc(ref, { ...settings, workerId, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getMoverOpportunities(targetCity: string, category?: string): Promise<JobOpportunity[]> {
  const mock: JobOpportunity[] = [
    { id: '1', title: 'Senior Developer', city: targetCity, category: category ?? 'tech', salary: '$120k', postedAt: new Date().toISOString() },
    { id: '2', title: 'Project Manager', city: targetCity, category: category ?? 'management', salary: '$95k', postedAt: new Date().toISOString() },
    { id: '3', title: 'UX Designer', city: targetCity, category: category ?? 'design', salary: '$85k', postedAt: new Date().toISOString() },
  ]
  if (!db) return mock
  try {
    let q = query(collection(db, 'jobs'), where('city', '==', targetCity))
    if (category) q = query(q, where('category', '==', category))
    const snap = await getDocs(q)
    if (snap.empty) return mock
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as JobOpportunity)
  } catch {
    return mock
  }
}

export async function getMoverStats(workerId?: string): Promise<MoverStats> {
  const mock: MoverStats = {
    totalMoverWorkers: 1240,
    averageRelocationSuccessRate: 84,
    topRelocationCities: ['Austin, TX', 'Miami, FL', 'Denver, CO', 'Nashville, TN', 'Phoenix, AZ'],
    averageTimeToRelocation: '4.2 months',
    premiumMatchRate: 72,
  }
  if (!db) return mock
  return mock
}

export async function getMoverLeaderboard(limit = 10): Promise<MoverLeaderboardEntry[]> {
  const mock: MoverLeaderboardEntry[] = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    rank: i + 1,
    userId: `mover-user-${i + 1}`,
    displayName: ['Riley Evans', 'Casey Martinez', 'Morgan Taylor', 'Drew Wilson', 'Quinn Anderson'][i],
    score: [93, 87, 81, 77, 72][i],
    tier: (['master', 'master', 'expert', 'expert', 'professional'] as const)[i],
    completionRate: [97, 93, 88, 85, 80][i],
    trustShields: [5, 5, 4, 4, 3][i],
    isRelocationReady: true,
    targetRelocationCity: ['Austin, TX', 'Miami, FL', 'Denver, CO', 'Nashville, TN', 'Phoenix, AZ'][i],
    relocationSuccessRate: [95, 90, 85, 82, 80][i],
  }))
  if (!db) return mock
  return mock
}
