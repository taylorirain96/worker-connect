import type { ReputationTier } from '@/types/reputation'

interface ReputationInput {
  completionRate: number
  averageRating: number
  verificationCount: number
  avgResponseTimeHours: number
  portfolioItemCount: number
}

interface ReputationResult {
  score: number
  tier: ReputationTier
  trustShields: number
}

export function calculateReputationScore(data: ReputationInput): ReputationResult {
  const completionScore = Math.min(100, Math.max(0, data.completionRate))
  const ratingScore = Math.min(100, Math.max(0, (data.averageRating / 5) * 100))
  const verificationScore = Math.min(100, Math.max(0, (data.verificationCount / 5) * 100))
  const responseTimeScore = Math.min(100, Math.max(0, 100 - data.avgResponseTimeHours * 2))
  const portfolioScore = Math.min(100, data.portfolioItemCount * 10)

  const score = Math.round(
    completionScore * 0.35 +
    ratingScore * 0.30 +
    verificationScore * 0.20 +
    responseTimeScore * 0.10 +
    portfolioScore * 0.05
  )

  // Tier assignment: rookie 0–40, professional 41–70, expert 71–85, master 86–100
  let tier: ReputationTier
  if (score <= 40) tier = 'rookie'
  else if (score <= 70) tier = 'professional'
  else if (score <= 85) tier = 'expert'
  else tier = 'master'

  // Trust shields: 1 (0–19), 2 (20–39), 3 (40–59), 4 (60–79), 5 (80–100)
  let trustShields: number
  if (score <= 19) trustShields = 1
  else if (score <= 39) trustShields = 2
  else if (score <= 59) trustShields = 3
  else if (score <= 79) trustShields = 4
  else trustShields = 5

  return { score, tier, trustShields }
}

export function getTierLabel(tier: ReputationTier): string {
  const labels: Record<ReputationTier, string> = {
    rookie: 'Rookie',
    professional: 'Professional',
    expert: 'Expert',
    master: 'Master',
  }
  return labels[tier]
}

export function getTierColor(tier: ReputationTier): string {
  const colors: Record<ReputationTier, string> = {
    rookie: 'text-gray-500',
    professional: 'text-blue-500',
    expert: 'text-purple-500',
    master: 'text-yellow-500',
  }
  return colors[tier]
}
