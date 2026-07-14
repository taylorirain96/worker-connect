export interface LeaderboardPrizeDefinition {
  rank: 1 | 2 | 3
  label: string
  prize: string
  boostReward: number
  badgeId: 'weekly_champion' | 'weekly_runner_up' | 'weekly_rising_star'
}

export interface AchievementRewardDefinition {
  id: string
  badgeId: string
  label: string
  how: string
  reward: string
  boostReward: number
}

export const LEADERBOARD_PRIZES: LeaderboardPrizeDefinition[] = [
  { rank: 1, label: '🥇 #1 Worker of the Month', prize: '+25 Boosts', boostReward: 25, badgeId: 'weekly_champion' },
  { rank: 2, label: '🥈 #2', prize: '+15 Boosts', boostReward: 15, badgeId: 'weekly_runner_up' },
  { rank: 3, label: '🥉 #3', prize: '+10 Boosts', boostReward: 10, badgeId: 'weekly_rising_star' },
]

export const ACHIEVEMENT_REWARDS: AchievementRewardDefinition[] = [
  { id: 'high_value', badgeId: 'high_value', label: '💎 High Value', how: 'Complete a $5,000+ job', reward: '+5 Boosts', boostReward: 5 },
  { id: 'consistent', badgeId: 'consistent', label: '🔄 Consistent', how: '1 job every 30 days for 3 months', reward: '+5 Boosts', boostReward: 5 },
  { id: 'trusted', badgeId: 'trusted', label: '⭐ Trusted', how: '5 jobs all rated 4.5+ stars', reward: '+5 Boosts + free verified badge', boostReward: 5 },
  { id: 'big_earner', badgeId: 'big_earner', label: '💰 Big Earner', how: 'Earn $5,000 in a month', reward: '+20 Boosts (enough for a 24-hour 8% commission trial)', boostReward: 20 },
  { id: 'ten_jobs', badgeId: 'ten_jobs', label: '🎯 10 Jobs', how: 'Complete 10 jobs', reward: '+5 Boosts', boostReward: 5 },
  { id: 'fifty_jobs', badgeId: 'fifty_jobs', label: '💼 50 Jobs', how: 'Complete 50 jobs', reward: '+20 Boosts', boostReward: 20 },
]

export const ACHIEVEMENT_BADGES = ACHIEVEMENT_REWARDS.map(({ label, how, reward }) => ({
  badge: label,
  how,
  reward,
}))
