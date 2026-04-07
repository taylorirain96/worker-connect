import type { CompletionMetrics, CompletionTrendPoint } from '@/types/reputation'

// ─── Core Calculation ─────────────────────────────────────────────────────────

/**
 * Calculate the completion rate as a percentage.
 * Returns 0 when totalContracts is 0 to avoid division by zero.
 */
export function calcCompletionRate(
  completedContracts: number,
  totalContracts: number
): number {
  if (totalContracts === 0) return 0
  return Math.round((completedContracts / totalContracts) * 100)
}

// ─── Label Helpers ────────────────────────────────────────────────────────────

/**
 * Get a human-readable label for a completion rate value.
 */
export function getCompletionRateLabel(rate: number): string {
  if (rate >= 95) return 'Exceptional'
  if (rate >= 85) return 'Excellent'
  if (rate >= 75) return 'Good'
  if (rate >= 60) return 'Average'
  return 'Needs Improvement'
}

/**
 * Get a CSS colour token for the completion rate badge.
 */
export function getCompletionRateColor(rate: number): string {
  if (rate >= 95) return 'text-green-500'
  if (rate >= 85) return 'text-emerald-500'
  if (rate >= 75) return 'text-yellow-500'
  if (rate >= 60) return 'text-orange-500'
  return 'text-red-500'
}

// ─── Trend Analysis ───────────────────────────────────────────────────────────

/**
 * Determine whether the completion rate is improving, declining or stable
 * based on the last N trend points.
 */
export function analyzeCompletionTrend(
  trend: CompletionTrendPoint[],
  lookback = 3
): 'improving' | 'declining' | 'stable' {
  if (trend.length < 2) return 'stable'
  const recent = trend.slice(-lookback)
  const first = recent[0].rate
  const last = recent[recent.length - 1].rate
  const diff = last - first
  if (diff >= 3) return 'improving'
  if (diff <= -3) return 'declining'
  return 'stable'
}

// ─── Pro/Job-Hopper Classification ────────────────────────────────────────────

export type WorkerClassification = 'Pro' | 'Reliable' | 'Average' | 'Job-Hopper'

/**
 * Classify a worker based on their completion rate.
 */
export function classifyWorker(completionRate: number): WorkerClassification {
  if (completionRate >= 95) return 'Pro'
  if (completionRate >= 85) return 'Reliable'
  if (completionRate >= 70) return 'Average'
  return 'Job-Hopper'
}

// ─── Metrics Builder ──────────────────────────────────────────────────────────

export function buildCompletionMetrics(
  userId: string,
  completedContracts: number,
  totalContracts: number,
  abandonedJobs: number,
  completionTrend: CompletionTrendPoint[]
): CompletionMetrics {
  return {
    userId,
    completedContracts,
    totalContracts,
    completionRate: calcCompletionRate(completedContracts, totalContracts),
    abandonedJobs,
    completionTrend,
    lastUpdated: new Date().toISOString(),
  }
}
