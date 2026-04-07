import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, limit as fsLimit, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ReputationScore, LeaderboardEntry, PortfolioItem } from '@/types/reputation'

const REPUTATION_COL = 'reputationScores'
const PORTFOLIO_COL = 'portfolioItems'

function toIso(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

const MOCK_SCORE: ReputationScore = {
  userId: 'mock-user',
  score: 78,
  tier: 'expert',
  trustShields: 4,
  completionRate: 92,
  averageRating: 4.6,
  verificationScore: 80,
  responseTimeScore: 70,
  portfolioScore: 60,
  calculatedAt: new Date().toISOString(),
}

export async function getReputationScore(userId: string): Promise<ReputationScore | null> {
  if (!db) return { ...MOCK_SCORE, userId }
  const ref = doc(db, REPUTATION_COL, userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    userId,
    calculatedAt: toIso(data.calculatedAt),
  } as ReputationScore
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  if (!db) {
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      rank: i + 1,
      userId: `mock-user-${i + 1}`,
      displayName: ['Alex Johnson', 'Maria Garcia', 'Sam Lee', 'Jordan Smith', 'Taylor Brown'][i],
      score: [95, 88, 82, 76, 71][i],
      tier: (['master', 'master', 'expert', 'expert', 'professional'] as const)[i],
      completionRate: [98, 95, 90, 87, 82][i],
      trustShields: [5, 5, 4, 4, 3][i],
      isRelocationReady: i % 2 === 0,
    }))
  }
  const q = query(collection(db, REPUTATION_COL), orderBy('score', 'desc'), fsLimit(limit))
  const snap = await getDocs(q)
  return snap.docs.map((d, i) => {
    const data = d.data()
    return {
      ...data,
      rank: i + 1,
      userId: d.id,
    } as LeaderboardEntry
  })
}

export async function getPortfolio(workerId: string): Promise<PortfolioItem[]> {
  if (!db) return []
  const q = query(
    collection(db, PORTFOLIO_COL),
    where('workerId', '==', workerId),
    orderBy('completedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      completedAt: toIso(data.completedAt),
    } as PortfolioItem
  })
}

export async function addPortfolioItem(item: Omit<PortfolioItem, 'id'>): Promise<string> {
  if (!db) return `mock-${Date.now()}`
  const ref = await addDoc(collection(db, PORTFOLIO_COL), item)
  return ref.id
}

export async function getTrustBadges(userId: string): Promise<{ shields: number; badges: string[] }> {
  if (!db) return { shields: 4, badges: ['Verified Pro', 'Top Rated', 'Quick Responder'] }
  const score = await getReputationScore(userId)
  if (!score) return { shields: 1, badges: [] }
  const badges: string[] = []
  if (score.completionRate >= 95) badges.push('Elite Completer')
  if (score.averageRating >= 4.8) badges.push('Top Rated')
  if (score.responseTimeScore >= 80) badges.push('Quick Responder')
  if (score.verificationScore >= 80) badges.push('Verified Pro')
  if (score.tier === 'master') badges.push('Master Worker')
  return { shields: score.trustShields, badges }
}
