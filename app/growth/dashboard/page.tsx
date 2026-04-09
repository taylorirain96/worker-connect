'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import QuickInsightsPanel from '@/components/growth/QuickInsightsPanel'
import GrowthScoreDashboard from '@/components/growth/GrowthScoreDashboard'
import GrowthStageIndicator from '@/components/growth/GrowthStageIndicator'
import EarningsTrendChart from '@/components/growth/EarningsTrendChart'
import PeerBenchmarkingCard from '@/components/growth/PeerBenchmarkingCard'
import SkillsDemandAnalysis from '@/components/growth/SkillsDemandAnalysis'
import CompletionVelocityChart from '@/components/growth/CompletionVelocityChart'
import RatingTrajectoryChart from '@/components/growth/RatingTrajectoryChart'
import type { GrowthScore, EarningsTrend, PeerComparison, ChurnRiskProfile, LifecycleStage } from '@/types'

export default function GrowthDashboardPage() {
  const [growthScore, setGrowthScore] = useState<GrowthScore | null>(null)
  const [earningsTrend, setEarningsTrend] = useState<EarningsTrend[]>([])
  const [peerData, setPeerData] = useState<PeerComparison[]>([])
  const [churnRisk, setChurnRisk] = useState<ChurnRiskProfile | null>(null)
  const [lifecycle, setLifecycle] = useState<LifecycleStage | null>(null)
  const [skillsDemand, setSkillsDemand] = useState<Array<{ skill: string; demand: number; trend: string; avgRate: number }>>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

  const workerId = 'demo'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [gs, et, peer, churn, lc, sd] = await Promise.all([
          fetch(`/api/analytics/worker/growth-score?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/analytics/worker/earnings?workerId=${workerId}&period=${period}`).then((r) => r.json()),
          fetch(`/api/insights/peer-comparison?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/lifecycle/churn-risk?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/lifecycle/stage?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/analytics/worker/skills-demand?workerId=${workerId}`).then((r) => r.json()),
        ])
        setGrowthScore(gs)
        setEarningsTrend(et)
        setPeerData(peer)
        setChurnRisk(churn)
        setLifecycle(lc)
        setSkillsDemand(sd)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [period])

  const handlePeriodChange = (p: 'daily' | 'weekly' | 'monthly') => setPeriod(p)

  if (loading || !growthScore || !churnRisk || !lifecycle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Growth Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your performance, earnings, and career growth</p>
        </div>

        <div className="mb-6">
          <QuickInsightsPanel growthScore={growthScore} churnRisk={churnRisk} lifecycle={lifecycle} />
        </div>

        <div className="mb-6">
          <GrowthStageIndicator data={lifecycle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GrowthScoreDashboard data={growthScore} />
          <EarningsTrendChart data={earningsTrend} onPeriodChange={handlePeriodChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CompletionVelocityChart />
          <RatingTrajectoryChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PeerBenchmarkingCard data={peerData} />
          <SkillsDemandAnalysis data={skillsDemand} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
