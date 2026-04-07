/**
 * Completion-rate calculation helpers.
 */

/** Calculate completion percentage, guarded against division by zero. */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Classify a worker based on their completion rate and contract history.
 * - Pro:        rate >= 80 AND total >= 5
 * - Job-Hopper: rate < 60 AND total >= 3
 * - New:        total < 3 (or everything else)
 */
export function classifyWorker(
  rate: number,
  total: number
): 'Pro' | 'Job-Hopper' | 'New' {
  if (rate >= 80 && total >= 5) return 'Pro'
  if (rate < 60 && total >= 3) return 'Job-Hopper'
  return 'New'
}

/**
 * Determine the trend direction from a chronological history array.
 * Compares the last value against the first to decide direction.
 * Returns 'stable' when the history has fewer than 2 entries.
 */
export function getTrendDirection(
  history: { month: string; rate: number }[]
): 'up' | 'down' | 'stable' {
  if (history.length < 2) return 'stable'
  const first = history[0].rate
  const last = history[history.length - 1].rate
  const delta = last - first
  if (delta > 2) return 'up'
  if (delta < -2) return 'down'
  return 'stable'
}

/**
 * Whether a worker is ready to accept relocation jobs.
 * Requires a target city to be set AND a completion rate >= 80.
 */
export function isRelocationReady(
  targetCity: string | null,
  completionRate: number
): boolean {
  return targetCity !== null && targetCity.trim().length > 0 && completionRate >= 80
}
