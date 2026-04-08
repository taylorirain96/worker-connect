'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import JobMatcher from '@/components/jobs/JobMatcher'
import { useAuth } from '@/components/providers/AuthProvider'
import { Briefcase, Target, Info } from 'lucide-react'

function MatchedJobsContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [workerId, setWorkerId] = useState<string>('')

  useEffect(() => {
    // Prefer explicit workerId query param (for previews/demos), else use logged-in user
    const queryId = searchParams.get('workerId')
    if (queryId) {
      setWorkerId(queryId)
    } else if (user?.uid) {
      setWorkerId(user.uid)
    }
  }, [user, searchParams])

  if (!workerId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
        <Briefcase className="h-12 w-12 mb-4 opacity-30" />
        <p className="font-medium text-lg">Sign in to view matched jobs</p>
        <p className="text-sm mt-1">Your personalized job matches will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-sm">
        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Personalized Job Matches</p>
          <p className="mt-0.5 text-blue-700 dark:text-blue-400">
            Jobs are scored based on your skills (40%), rating (20%), completion rate (20%),
            budget (10%) and location (10%). Mover Mode workers get priority boosts for
            jobs in their target city.
          </p>
        </div>
      </div>

      <JobMatcher workerId={workerId} />
    </div>
  )
}

export default function MatchedJobsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Matched Jobs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Intelligent job recommendations tailored to your profile
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          }
        >
          <MatchedJobsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
