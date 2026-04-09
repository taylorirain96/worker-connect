import type { ChurnRiskProfile, EngagementScore, LifecycleStage } from '@/types'

export async function getChurnRisk(_workerId: string): Promise<ChurnRiskProfile> {
  await new Promise((r) => setTimeout(r, 300))
  return {
    workerId: _workerId,
    score: 28,
    level: 'low',
    factors: [
      { factor: 'Login Frequency',  impact: 5,  description: 'Logging in 5+ days/week — excellent engagement' },
      { factor: 'Job Completion',   impact: 8,  description: '94% completion rate maintains good standing' },
      { factor: 'Earnings Growth',  impact: 10, description: 'Earnings up 12% MoM — positive momentum' },
      { factor: 'Response Time',    impact: 5,  description: 'Quick responses build strong employer relationships' },
    ],
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    recommendations: [
      'Keep your availability calendar updated',
      'Apply to 2-3 new job types to diversify income',
      'Consider raising your rates — your scores support it',
    ],
  }
}

export async function getEngagementScore(_workerId: string): Promise<EngagementScore> {
  await new Promise((r) => setTimeout(r, 200))
  return {
    score: 78,
    trend: 'up',
    factors: {
      loginFrequency:     90,
      jobApplications:    75,
      completionRate:     94,
      responseTime:       85,
      profileCompleteness: 70,
    },
    period: 'Last 30 days',
  }
}

export async function getLifecycleStage(_workerId: string): Promise<LifecycleStage> {
  await new Promise((r) => setTimeout(r, 200))
  return {
    stage: 'pro',
    label: 'Pro Worker',
    description: "You're a reliable professional with a strong track record",
    nextStage: 'master',
    progressToNext: 62,
    requirements: [
      'Complete 100 total jobs (currently 59)',
      'Maintain 4.8+ rating for 3 consecutive months',
      'Earn $5,000 in a single month',
    ],
  }
}

export async function getRetentionRecommendations(_workerId: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 200))
  return [
    "You're on track — keep your 4.8+ rating to reach Master status",
    'Apply to higher-budget jobs — your rating supports premium pricing',
    'Enable job alerts for your top categories',
    'Respond to employer messages within 1 hour for best results',
    'Complete your profile to attract more direct invites',
  ]
}
