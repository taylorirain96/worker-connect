import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore'
import type { ReputationScore, ReputationLeaderboardEntry, EarningsByTier } from '@/types/reputation'
import { calculateReputationScore, getReputationTier, getTrustShields } from '@/lib/utils/reputationAlgorithm'

export async function getReputationScore(userId: string): Promise<ReputationScore | null> {
  if (!db) return null
  try {
    const ref = doc(db, 'reputationScores', userId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as ReputationScore
  } catch {
    return null
  }
}

export async function computeAndSaveReputation(
  userId: string,
  params: {
    completionRate: number
    rating: number
    verificationScore: number
    responseTimeScore: number
    portfolioScore: number
  },
): Promise<ReputationScore> {
  const score = calculateReputationScore(params)
  const tier = getReputationTier(score)
  const trustShields = getTrustShields(score)
  const reputationScore: ReputationScore = {
    userId,
    score,
    tier,
    trustShields,
    breakdown: {
      completionRate: params.completionRate,
      rating: params.rating,
      verification: params.verificationScore,
      responseTime: params.responseTimeScore,
      portfolio: params.portfolioScore,
    },
    calculatedAt: new Date().toISOString(),
  }
  if (db) {
    const ref = doc(db, 'reputationScores', userId)
    await setDoc(ref, reputationScore)
  }
  return reputationScore
}

export async function getLeaderboard(limit: number = 10): Promise<ReputationLeaderboardEntry[]> {
  if (!db) return []
  try {
    const q = query(collection(db, 'reputationScores'), orderBy('score', 'desc'), firestoreLimit(limit))
    const snap = await getDocs(q)
    return snap.docs.map((d, i) => {
      const data = d.data() as ReputationScore
      return {
        userId: data.userId,
        name: (d.data().name as string) || 'Worker',
        avatar: d.data().avatar as string | undefined,
        score: data.score,
        tier: data.tier,
        trustShields: data.trustShields,
        completionRate: data.breakdown.completionRate,
        rank: i + 1,
      }
    })
  } catch {
    return []
  }
}

export async function getEarningsByTier(): Promise<EarningsByTier[]> {
  return [
    { tier: 'rookie', avgEarnings: 600, totalWorkers: 0, premiumJobAccess: false },
    { tier: 'professional', avgEarnings: 1500, totalWorkers: 0, premiumJobAccess: false },
    { tier: 'expert', avgEarnings: 3000, totalWorkers: 0, premiumJobAccess: true },
    { tier: 'master', avgEarnings: 6000, totalWorkers: 0, premiumJobAccess: true },
  ]
}
