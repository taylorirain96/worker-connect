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
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ReputationScore, LeaderboardEntry } from '@/types/reputation'
import {
  calculateReputationScore,
  getShieldCount,
  type ReputationInputs,
} from '@/lib/utils/reputationAlgorithm'

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getReputationScore(
  userId: string
): Promise<ReputationScore | null> {
  if (!db) return null
  const ref = doc(db, 'reputationScores', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    userId,
    overallScore: data.overallScore ?? 0,
    tier: data.tier ?? 'Rookie',
    completionRate: data.completionRate ?? 0,
    averageRating: data.averageRating ?? 0,
    verificationLevel: data.verificationLevel ?? 0,
    responseTime: data.responseTime ?? 0,
    portfolioQuality: data.portfolioQuality ?? 0,
    components: data.components ?? {
      completionRate: 0,
      rating: 0,
      verification: 0,
      responseTime: 0,
      portfolio: 0,
    },
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }
}

// ─── Write / Recalculate ──────────────────────────────────────────────────────

export async function recalculateReputation(
  userId: string,
  inputs: ReputationInputs
): Promise<ReputationScore> {
  const { overallScore, tier, components } = calculateReputationScore(inputs)

  const score: Omit<ReputationScore, 'userId'> = {
    overallScore,
    tier,
    completionRate: inputs.completionRate,
    averageRating: inputs.averageRating,
    verificationLevel: inputs.verificationLevel,
    responseTime: inputs.responseTimeHours,
    portfolioQuality: inputs.portfolioQuality,
    components,
    updatedAt: new Date().toISOString(),
  }

  if (db) {
    const ref = doc(db, 'reputationScores', userId)
    await setDoc(ref, { ...score, updatedAt: serverTimestamp() }, { merge: true })
  }

  return { userId, ...score }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getReputationLeaderboard(
  topN = 100
): Promise<LeaderboardEntry[]> {
  if (!db) return []
  const ref = collection(db, 'reputationScores')
  const q = query(ref, orderBy('overallScore', 'desc'), limit(topN))
  const snap = await getDocs(q)

  return snap.docs.map((d, index) => {
    const data = d.data()
    return {
      rank: index + 1,
      userId: d.id,
      displayName: data.displayName ?? 'Worker',
      avatarUrl: data.avatarUrl,
      score: data.overallScore ?? 0,
      tier: data.tier ?? 'Rookie',
      completionRate: data.completionRate ?? 0,
      verificationLevel: data.verificationLevel ?? 0,
      shieldCount: getShieldCount(data.overallScore ?? 0),
    }
  })
}

// ─── Trust Badges ─────────────────────────────────────────────────────────────

export async function getTrustBadges(userId: string) {
  const score = await getReputationScore(userId)
  if (!score) return null

  const responseTimeLabel = getResponseTimeLabel(score.responseTime)

  return {
    userId,
    shieldCount: getShieldCount(score.overallScore),
    reputationScore: score.overallScore,
    verificationLevel: score.verificationLevel,
    completionRate: score.completionRate,
    responseTimeLabel,
  }
}

function getResponseTimeLabel(hours: number): string {
  if (hours <= 1) return 'Within 1 hour'
  if (hours <= 4) return 'Within 4 hours'
  if (hours <= 24) return 'Within 24 hours'
  return 'Within a few days'
}

// ─── Update Partial Fields ────────────────────────────────────────────────────

export async function updateReputationField(
  userId: string,
  fields: Partial<Omit<ReputationScore, 'userId' | 'updatedAt'>>
): Promise<void> {
  if (!db) return
  const ref = doc(db, 'reputationScores', userId)
  await updateDoc(ref, { ...fields, updatedAt: serverTimestamp() })
}
