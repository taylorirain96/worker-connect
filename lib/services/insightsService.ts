import type { PerformanceMetrics, PeerComparison } from '@/types'

export async function getPerformanceInsights(_workerId: string): Promise<PerformanceMetrics[]> {
  await new Promise((r) => setTimeout(r, 300))
  return [
    { category: 'Plumbing',    completionRate: 96, avgRating: 4.9, totalJobs: 28, earnings: 6720, avgDuration: 2.8 },
    { category: 'Electrical',  completionRate: 91, avgRating: 4.7, totalJobs: 15, earnings: 8250, avgDuration: 4.1 },
    { category: 'HVAC',        completionRate: 88, avgRating: 4.8, totalJobs: 9,  earnings: 5400, avgDuration: 5.5 },
    { category: 'Carpentry',   completionRate: 94, avgRating: 4.6, totalJobs: 7,  earnings: 3150, avgDuration: 6.2 },
    { category: 'General',     completionRate: 85, avgRating: 4.5, totalJobs: 12, earnings: 2760, avgDuration: 3.0 },
  ]
}

export async function getStrengths(_workerId: string): Promise<Array<{ skill: string; score: number; description: string }>> {
  await new Promise((r) => setTimeout(r, 200))
  return [
    { skill: 'Plumbing',         score: 96, description: 'Top 5% completion rate in your area' },
    { skill: 'Customer Service', score: 94, description: '4.9 average rating across 47 reviews' },
    { skill: 'Response Time',    score: 91, description: 'Average 1.4 hour response — faster than 90% of peers' },
    { skill: 'Electrical',       score: 88, description: 'Strong complex project delivery record' },
    { skill: 'Reliability',      score: 87, description: 'Only 6% cancellation rate' },
  ]
}

export async function getImprovements(_workerId: string): Promise<Array<{ area: string; priority: 'high' | 'medium' | 'low'; recommendation: string; impact: number }>> {
  await new Promise((r) => setTimeout(r, 200))
  return [
    { area: 'Profile Completeness', priority: 'high',   recommendation: 'Add 3 portfolio photos to increase job invites by 40%', impact: 40 },
    { area: 'HVAC Certification',   priority: 'high',   recommendation: 'Get EPA 608 cert to unlock $200+ HVAC jobs', impact: 35 },
    { area: 'Weekend Availability', priority: 'medium', recommendation: 'Mark weekends available — 60% more jobs posted', impact: 25 },
    { area: 'Response Speed',       priority: 'medium', recommendation: 'Respond within 30 min to improve acceptance rate', impact: 20 },
    { area: 'Carpentry Skills',     priority: 'low',    recommendation: 'Complete carpentry course to diversify income', impact: 15 },
  ]
}

export async function getPeerComparison(_workerId: string): Promise<PeerComparison[]> {
  await new Promise((r) => setTimeout(r, 300))
  return [
    { metric: 'Completion Rate',    workerValue: 94,   peerAvg: 82,   topPercentile: 98,   percentile: 88 },
    { metric: 'Avg Rating',         workerValue: 4.8,  peerAvg: 4.3,  topPercentile: 5.0,  percentile: 82 },
    { metric: 'Response Time (hr)', workerValue: 1.4,  peerAvg: 3.2,  topPercentile: 0.5,  percentile: 79 },
    { metric: 'Monthly Earnings',   workerValue: 3200, peerAvg: 2100, topPercentile: 5800, percentile: 72 },
    { metric: 'Jobs Per Month',     workerValue: 8,    peerAvg: 6,    topPercentile: 14,   percentile: 65 },
    { metric: 'Acceptance Rate',    workerValue: 82,   peerAvg: 74,   topPercentile: 95,   percentile: 70 },
  ]
}
