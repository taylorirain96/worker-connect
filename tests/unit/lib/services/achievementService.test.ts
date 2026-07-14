import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getNewlyEarnedAchievements,
  hasConsistentCompletionStreak,
} from '@/lib/services/achievementService'

const RECENT_DATES = [
  '2026-07-10T12:00:00.000Z',
  '2026-06-12T12:00:00.000Z',
  '2026-04-20T12:00:00.000Z',
]

describe('achievementService threshold logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('detects a three-month completion streak across rolling 30-day buckets', () => {
    expect(hasConsistentCompletionStreak(RECENT_DATES)).toBe(true)
    expect(hasConsistentCompletionStreak(RECENT_DATES.slice(0, 2))).toBe(false)
  })

  it('returns only newly crossed achievements', () => {
    const earned = getNewlyEarnedAchievements({
      completedJobs: 10,
      currentJobValue: 5200,
      rolling30DayEarnings: 5400,
      trustedJobs: 5,
      recentCompletedJobDates: RECENT_DATES,
      awardedAchievements: [],
    }).map((achievement) => achievement.id)

    expect(earned).toEqual([
      'high_value',
      'consistent',
      'trusted',
      'big_earner',
      'ten_jobs',
    ])
  })

  it('is idempotent once achievements are stored on the worker profile', () => {
    const firstPass = getNewlyEarnedAchievements({
      completedJobs: 50,
      currentJobValue: 5500,
      rolling30DayEarnings: 6000,
      trustedJobs: 5,
      recentCompletedJobDates: RECENT_DATES,
      awardedAchievements: [],
    }).map((achievement) => achievement.id)

    const secondPass = getNewlyEarnedAchievements({
      completedJobs: 50,
      currentJobValue: 5500,
      rolling30DayEarnings: 6000,
      trustedJobs: 5,
      recentCompletedJobDates: RECENT_DATES,
      awardedAchievements: firstPass,
    })

    expect(firstPass).toContain('fifty_jobs')
    expect(secondPass).toEqual([])
  })
})
