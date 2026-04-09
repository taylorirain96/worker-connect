'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PerformanceBreakdown from '@/components/insights/PerformanceBreakdown'
import StrengthsHighlight from '@/components/insights/StrengthsHighlight'
import ImprovementSuggestions from '@/components/insights/ImprovementSuggestions'
import PeerComparisonTable from '@/components/insights/PeerComparisonTable'
import SuccessPatternAnalysis from '@/components/insights/SuccessPatternAnalysis'
import type { PerformanceMetrics, PeerComparison } from '@/types'

interface Strength { skill: string; score: number; description: string }
interface Improvement { area: string; priority: 'high' | 'medium' | 'low'; recommendation: string; impact: number }

export default function InsightsPage() {
  const [performance, setPerformance] = useState<PerformanceMetrics[]>([])
  const [strengths, setStrengths] = useState<Strength[]>([])
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [peerData, setPeerData] = useState<PeerComparison[]>([])
  const [loading, setLoading] = useState(true)

  const workerId = 'demo'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [perf, str, imp, peer] = await Promise.all([
          fetch(`/api/insights/performance?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/insights/strengths?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/insights/improvements?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/insights/peer-comparison?workerId=${workerId}`).then((r) => r.json()),
        ])
        setPerformance(perf)
        setStrengths(str)
        setImprovements(imp)
        setPeerData(peer)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Insights</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Deep analysis of your strengths, areas for growth, and peer benchmarks</p>
        </div>

        <div className="mb-6">
          <PerformanceBreakdown data={performance} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StrengthsHighlight strengths={strengths} />
          <ImprovementSuggestions improvements={improvements} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PeerComparisonTable data={peerData} />
          <SuccessPatternAnalysis />
        </div>
      </main>
      <Footer />
    </div>
  )
}
