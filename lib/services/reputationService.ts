/**
 * Reputation service — Firestore helpers for reputation scores, leaderboard, badges.
 */
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  ReputationScore,
  ReputationTier,
  ReputationLeaderboardEntry,
  Badge,
  EarningsByTier,
} from '@/types/reputation'
import type { SubscriptionPlan } from '@/types/payment'
import {
  calculateReputationScore,
  getTier,
  getTrustShields,
  type ScoreParams,
} from '@/lib/utils/reputationAlgorithm'

// ─── Collection names ────────────────────────────────────────────────────────

const SCORES_COL = 'reputationScores'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toIso(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function docToScore(id: string, data: Record<string, unknown>): ReputationScore {
  const shields = data.trustShields as number
  const validShields =
    shields >= 1 && shields <= 5 ? (shields as 1 | 2 | 3 | 4 | 5) : 1

  return {
    workerId: id,
    overallScore: (data.overallScore as number) ?? 0,
    tier: (data.tier as ReputationTier) ?? 'Rookie',
    trustShields: validShields,
    breakdown: (data.breakdown as ReputationScore['breakdown']) ?? {
      completionRate: 0,
      rating: 0,
      verification: 0,
      responseTime: 0,
      portfolioQuality: 0,
    },
    lastCalculated: toIso(data.lastCalculated as Timestamp | string | undefined),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch the stored reputation score for a user. */
export async function getReputationScore(userId: string): Promise<ReputationScore | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, SCORES_COL, userId))
  if (!snap.exists()) return null
  return docToScore(snap.id, snap.data() as Record<string, unknown>)
}

/** Calculate from raw params, persist, and return the ReputationScore. */
export async function calculateAndSaveScore(
  userId: string,
  params: ScoreParams
): Promise<ReputationScore> {
  const breakdown = calculateReputationScore(params)
  const score = breakdown.overallScore
  const tier = getTier(score)
  const trustShields = getTrustShields(score)

  const record: ReputationScore = {
    workerId: userId,
    overallScore: score,
    tier,
    trustShields,
    breakdown: {
      completionRate: breakdown.completionRate,
      rating: breakdown.rating,
      verification: breakdown.verification,
      responseTime: breakdown.responseTime,
      portfolioQuality: breakdown.portfolioQuality,
    },
    lastCalculated: new Date().toISOString(),
  }

  if (db) {
    await setDoc(doc(db, SCORES_COL, userId), {
      ...record,
      lastCalculated: new Date(),
    })
  }

  return record
}

/** Return the top `n` workers sorted by overallScore descending. */
export async function getLeaderboard(n: number = 10): Promise<ReputationLeaderboardEntry[]> {
  if (!db) return []
  const q = query(collection(db, SCORES_COL), orderBy('overallScore', 'desc'), limit(n))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const s = docToScore(d.id, d.data() as Record<string, unknown>)
    return {
      workerId: s.workerId,
      workerName: (d.data().workerName as string) ?? 'Worker',
      workerAvatar: d.data().workerAvatar as string | undefined,
      reputationScore: s.overallScore,
      tier: s.tier,
      trustShields: s.trustShields,
      completionRate: s.breakdown.completionRate,
    } satisfies ReputationLeaderboardEntry
  })
}

/** Return trust-badge data and earned badges for a user. */
export async function getTrustBadges(userId: string): Promise<{
  shields: 1 | 2 | 3 | 4 | 5
  tier: ReputationTier
  score: number
  badges: Badge[]
}> {
  const score = await getReputationScore(userId)
  const shields = score?.trustShields ?? 1
  const tier = score?.tier ?? 'Rookie'
  const overall = score?.overallScore ?? 0

  const badges: Badge[] = []

  if (overall >= 41) {
    badges.push({
      id: 'professional',
      name: 'Professional',
      description: 'Reached Professional tier',
      icon: 'award',
      earnedAt: score?.lastCalculated ?? new Date().toISOString(),
      category: 'achievement',
    })
  }
  if (overall >= 71) {
    badges.push({
      id: 'expert',
      name: 'Expert',
      description: 'Reached Expert tier',
      icon: 'star',
      earnedAt: score?.lastCalculated ?? new Date().toISOString(),
      category: 'achievement',
    })
  }
  if (overall >= 86) {
    badges.push({
      id: 'master',
      name: 'Master',
      description: 'Reached Master tier — top performer',
      icon: 'crown',
      earnedAt: score?.lastCalculated ?? new Date().toISOString(),
      category: 'achievement',
    })
  }

  return { shields, tier, score: overall, badges }
}

// ─── Tier → subscription plan mapping ────────────────────────────────────────

const TIER_PLAN_MAP: Record<ReputationTier, SubscriptionPlan> = {
  Rookie: 'free',
  Professional: 'pro',
  Expert: 'pro',
  Master: 'enterprise',
}

/** Return mock earnings data per reputation tier. */
export function getEarningsByTier(): EarningsByTier[] {
  const tiers: ReputationTier[] = ['Rookie', 'Professional', 'Expert', 'Master']
  const mock: Record<ReputationTier, { avg: number; total: number; top: number }> = {
    Rookie: { avg: 1200, total: 5400, top: 3500 },
    Professional: { avg: 3800, total: 3200, top: 9000 },
    Expert: { avg: 7500, total: 1100, top: 18000 },
    Master: { avg: 14000, total: 280, top: 45000 },
  }

  return tiers.map((tier) => ({
    tier,
    averageEarnings: mock[tier].avg,
    totalWorkers: mock[tier].total,
    topEarner: mock[tier].top,
    suggestedPlan: TIER_PLAN_MAP[tier],
  }))
}
