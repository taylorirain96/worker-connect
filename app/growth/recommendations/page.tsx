'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import JobRecommendationsList from '@/components/recommendations/JobRecommendationsList'
import EmptyRecommendationsState from '@/components/recommendations/EmptyRecommendationsState'
import type { JobRecommendation, RecommendationFeedback } from '@/types'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  const workerId = 'demo'

  useEffect(() => {
    fetch(`/api/recommendations/personalized?workerId=${workerId}`)
      .then((r) => r.json())
      .then((data) => setRecommendations(data))
      .finally(() => setLoading(false))
  }, [])

  const handleFeedback = async (feedback: RecommendationFeedback) => {
    await fetch('/api/recommendations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    })
  }

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Recommendations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Personalized job matches based on your skills and performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {recommendations.length > 0 ? (
              <JobRecommendationsList
                recommendations={recommendations}
                workerId={workerId}
                onFeedback={handleFeedback}
              />
            ) : (
              <EmptyRecommendationsState />
            )}
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle>How Matching Works</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold mt-0.5">•</span>
                    <span>Skills alignment with job requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold mt-0.5">•</span>
                    <span>Your ratings and completion history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold mt-0.5">•</span>
                    <span>Location proximity and availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold mt-0.5">•</span>
                    <span>Category specialization score</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
