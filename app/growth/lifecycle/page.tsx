'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import ChurnRiskIndicator from '@/components/lifecycle/ChurnRiskIndicator'
import EngagementScoreCard from '@/components/lifecycle/EngagementScoreCard'
import LifecycleStageCard from '@/components/lifecycle/LifecycleStageCard'
import type { ChurnRiskProfile, EngagementScore, LifecycleStage } from '@/types'

export default function LifecyclePage() {
  const [churnRisk, setChurnRisk] = useState<ChurnRiskProfile | null>(null)
  const [engagement, setEngagement] = useState<EngagementScore | null>(null)
  const [lifecycle, setLifecycle] = useState<LifecycleStage | null>(null)
  const [retentionRecs, setRetentionRecs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const workerId = 'demo'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [churn, eng, lc, recs] = await Promise.all([
          fetch(`/api/lifecycle/churn-risk?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/lifecycle/engagement?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/lifecycle/stage?workerId=${workerId}`).then((r) => r.json()),
          fetch(`/api/lifecycle/retention-recommendations?workerId=${workerId}`).then((r) => r.json()),
        ])
        setChurnRisk(churn)
        setEngagement(eng)
        setLifecycle(lc)
        setRetentionRecs(recs)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading || !churnRisk || !engagement || !lifecycle) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Worker Lifecycle</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your engagement, churn risk, and career stage</p>
        </div>

        <div className="mb-6">
          <LifecycleStageCard data={lifecycle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChurnRiskIndicator data={churnRisk} />
          <EngagementScoreCard data={engagement} />
        </div>

        {retentionRecs.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Retention Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {retentionRecs.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-primary-500 font-bold mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
