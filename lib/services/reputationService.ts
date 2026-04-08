import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore'
import type { ReputationScore, ReputationLeaderboardEntry, EarningsByTier } from '@/types/reputation'
import { calculateReputationScore, getReputationTier, getTrustShields } from '@/lib/utils/reputationAlgorithm'
import { EARNINGS_BY_REPUTATION_TIER } from '@/types/payment'

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
      const data = d.data() as ReputationScore & { name?: string; avatar?: string }
      return {
        userId: data.userId,
        name: data.name || 'Worker',
        avatar: data.avatar,
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
  return EARNINGS_BY_REPUTATION_TIER.map(e => ({
    tier: e.tier,
    avgEarnings: e.avgMonthlyEarnings,
    totalWorkers: 0,
    premiumJobAccess: e.premiumJobAccess,
  }))
}
