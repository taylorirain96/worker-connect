'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import EarningsProjectionChart from '@/components/intelligence/EarningsProjectionChart'
import RateBenchmarkChart from '@/components/intelligence/RateBenchmarkChart'
import PeakPeriodsAnalysis from '@/components/intelligence/PeakPeriodsAnalysis'
import IncomeStabilityGauge from '@/components/intelligence/IncomeStabilityGauge'
import EarningsBreakdownPie from '@/components/intelligence/EarningsBreakdownPie'
import OptimizationRecommendations from '@/components/intelligence/OptimizationRecommendations'
import type { EarningsProjection, RateBenchmark } from '@/types'

interface PeakPeriod { period: string; avgEarnings: number; jobCount: number; isHighSeason: boolean }
interface StabilityMetrics { score: number; volatility: number; trend: string; recommendation: string }

export default function EarningsPage() {
  const [projection, setProjection] = useState<EarningsProjection[]>([])
  const [benchmarks, setBenchmarks] = useState<RateBenchmark[]>([])
  const [peakPeriods, setPeakPeriods] = useState<PeakPeriod[]>([])
  const [stability, setStability] = useState<StabilityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const workerId = 'demo'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [proj, bench, peak, stab] = await Promise.all([
          fetch(`/api/intelligence/earnings-projection?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/intelligence/rate-benchmark?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/intelligence/peak-periods?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/intelligence/stability-metrics?workerId=${workerId}`).then((r) => r.json()),
        ])
        setProjection(proj)
        setBenchmarks(bench)
        setPeakPeriods(peak)
        setStability(stab)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading || !stability) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings Intelligence</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Projections, benchmarks, and optimization insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EarningsProjectionChart data={projection} />
          <IncomeStabilityGauge
            score={stability.score}
            volatility={stability.volatility}
            trend={stability.trend}
            recommendation={stability.recommendation}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RateBenchmarkChart data={benchmarks} />
          <PeakPeriodsAnalysis data={peakPeriods} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EarningsBreakdownPie />
          <OptimizationRecommendations benchmarks={benchmarks} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
