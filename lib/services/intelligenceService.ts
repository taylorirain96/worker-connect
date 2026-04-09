import type { EarningsProjection, RateBenchmark } from '@/types'

export async function getEarningsProjection(_workerId: string, months = 6): Promise<EarningsProjection[]> {
  await new Promise((r) => setTimeout(r, 300))
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const base = 3200 + i * 150
    const variance = 400 + i * 80
    return {
      month: monthNames[d.getMonth()],
      projected: Math.round(base),
      low:       Math.round(base - variance),
      high:      Math.round(base + variance),
      confidence: Math.max(40, 90 - i * 8),
    }
  })
}

export async function getRateBenchmarks(_workerId: string): Promise<RateBenchmark[]> {
  await new Promise((r) => setTimeout(r, 300))
  return [
    { skill: 'Plumbing',   workerRate: 85,  marketAvg: 75,  topPercentile: 110, region: 'NYC', trend: 'up' },
    { skill: 'Electrical', workerRate: 95,  marketAvg: 90,  topPercentile: 130, region: 'NYC', trend: 'up' },
    { skill: 'HVAC',       workerRate: 100, marketAvg: 105, topPercentile: 145, region: 'NYC', trend: 'stable' },
    { skill: 'Carpentry',  workerRate: 70,  marketAvg: 72,  topPercentile: 100, region: 'NYC', trend: 'stable' },
    { skill: 'Painting',   workerRate: 55,  marketAvg: 60,  topPercentile: 85,  region: 'NYC', trend: 'down' },
  ]
}

export async function getPeakPeriods(_workerId: string): Promise<Array<{ period: string; avgEarnings: number; jobCount: number; isHighSeason: boolean }>> {
  await new Promise((r) => setTimeout(r, 200))
  return [
    { period: 'Mon', avgEarnings: 320, jobCount: 2, isHighSeason: false },
    { period: 'Tue', avgEarnings: 480, jobCount: 3, isHighSeason: false },
    { period: 'Wed', avgEarnings: 420, jobCount: 3, isHighSeason: false },
    { period: 'Thu', avgEarnings: 560, jobCount: 4, isHighSeason: true  },
    { period: 'Fri', avgEarnings: 720, jobCount: 5, isHighSeason: true  },
    { period: 'Sat', avgEarnings: 840, jobCount: 6, isHighSeason: true  },
    { period: 'Sun', avgEarnings: 380, jobCount: 2, isHighSeason: false },
  ]
}

export async function getStabilityMetrics(_workerId: string): Promise<{ score: number; volatility: number; trend: string; recommendation: string }> {
  await new Promise((r) => setTimeout(r, 200))
  return {
    score: 72,
    volatility: 18,
    trend: 'improving',
    recommendation: 'Accept more recurring clients — they reduce income volatility by ~40%',
  }
}
