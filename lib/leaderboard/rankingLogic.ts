import type { JobCategory } from '@/types'

export interface LeaderboardEntry {
  rank: number
  previousRank?: number
  userId: string
  displayName: string
  photoURL?: string
  category?: JobCategory
  weeklyPoints: number
  jobsCompleted: number
  rating?: number
  trend: 'up' | 'down' | 'same' | 'new'
  badges?: string[]
  bonusAwarded?: boolean
}

export interface WeeklySnapshot {
  weekId: string        // e.g. "2024-W03"
  startDate: string     // ISO date string (Sunday)
  endDate: string       // ISO date string (Saturday)
  entries: LeaderboardEntry[]
  category?: JobCategory | 'all'
  createdAt: string
}

export interface RankBonus {
  rank: 1 | 2 | 3
  bonusPoints: number
  badgeId: string
  label: string
  multiplier: number
}

export const RANK_BONUSES: Record<1 | 2 | 3, RankBonus> = {
  1: { rank: 1, bonusPoints: 50, badgeId: 'weekly_champion', label: '🥇 Champion', multiplier: 1.5 },
  2: { rank: 2, bonusPoints: 30, badgeId: 'weekly_runner_up', label: '🥈 Runner-up', multiplier: 1.25 },
  3: { rank: 3, bonusPoints: 20, badgeId: 'weekly_rising_star', label: '🥉 Rising Star', multiplier: 1.1 },
}

export const LEADERBOARD_BADGE_DEFINITIONS: Record<string, { label: string; icon: string; description: string }> = {
  weekly_champion: { label: 'Champion', icon: '🥇', description: 'Ranked #1 on the weekly leaderboard' },
  weekly_runner_up: { label: 'Runner-up', icon: '🥈', description: 'Ranked #2 on the weekly leaderboard' },
  weekly_rising_star: { label: 'Rising Star', icon: '🥉', description: 'Ranked #3 on the weekly leaderboard' },
  top_10: { label: 'Top 10', icon: '🏆', description: 'Entered the weekly top 10' },
}

/**
 * Returns the ISO week identifier for a given date, e.g. "2024-W03".
 */
export function getWeekId(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayOfWeek = d.getUTCDay()
  // Shift so week starts on Sunday (0)
  d.setUTCDate(d.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7))
  const year = d.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const weekNumber = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getUTCDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

/**
 * Returns the Sunday and Saturday dates bounding the week that contains `date`.
 */
export function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  start.setDate(start.getDate() - day)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Assigns rank positions and trend indicators given an ordered array of entries
 * and the previous week's entries.
 */
export function assignRanks(
  entries: Omit<LeaderboardEntry, 'rank' | 'trend'>[],
  previousEntries: LeaderboardEntry[] = []
): LeaderboardEntry[] {
  const previousRankMap = new Map<string, number>(
    previousEntries.map((e) => [e.userId, e.rank])
  )

  return entries
    .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
    .map((entry, idx) => {
      const rank = idx + 1
      const prevRank = previousRankMap.get(entry.userId)
      let trend: LeaderboardEntry['trend'] = 'new'
      if (prevRank !== undefined) {
        if (rank < prevRank) trend = 'up'
        else if (rank > prevRank) trend = 'down'
        else trend = 'same'
      }
      return { ...entry, rank, previousRank: prevRank, trend }
    })
}

/**
 * Returns top-N entries from a ranked leaderboard list.
 */
export function getTopN(entries: LeaderboardEntry[], n = 10): LeaderboardEntry[] {
  return entries.slice(0, n)
}

/**
 * Calculates the bonus points and badge for a given rank (1–3 only).
 */
export function getBonusForRank(rank: number): RankBonus | null {
  if (rank === 1 || rank === 2 || rank === 3) return RANK_BONUSES[rank]
  return null
}
