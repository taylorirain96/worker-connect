'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import JobsForYouFeed from '@/components/jobs/JobsForYouFeed'
import SearchAlerts from '@/components/search/SearchAlerts'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import { Plus, Briefcase, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getJobs } from '@/lib/services/jobService'
import type { Job } from '@/types'

const EMPTY_FILTERS = {
  search: '',
  category: '',
  location: '',
  budgetMin: '',
  budgetMax: '',
  urgency: '',
  jobType: '',
  sortBy: '',
}

function JobsListContent() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'for-you'>(
    searchParams.get('tab') === 'for-you' ? 'for-you' : 'all'
  )

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    location: searchParams.get('location') ?? '',
    budgetMin: searchParams.get('budgetMin') ?? '',
    budgetMax: searchParams.get('budgetMax') ?? '',
    urgency: searchParams.get('urgency') ?? '',
    jobType: searchParams.get('jobType') ?? '',
    sortBy: searchParams.get('sortBy') ?? '',
  }))

  const syncUrl = useCallback((newFilters: typeof filters, tab: 'all' | 'for-you') => {
    const params = new URLSearchParams()
    if (tab === 'for-you') params.set('tab', 'for-you')
    Object.entries(newFilters).forEach(([key, value]) => { if (value) params.set(key, value) })
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const fetched = await getJobs()
        setJobs(fetched)
      } catch {
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const urgencyOrder = { emergency: 0, high: 1, medium: 2, low: 3 } as const

  const roleFilteredJobs = profile?.role === 'jobseeker'
    ? jobs.filter((job) => !job.jobType || job.jobType === 'employment')
    : jobs

  const filteredJobs = roleFilteredJobs.filter((job) => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category && job.category !== filters.category) return false
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.budgetMin && job.budget < Number(filters.budgetMin)) return false
    if (filters.budgetMax && job.budget > Number(filters.budgetMax)) return false
    if (filters.urgency && job.urgency !== filters.urgency) return false
    if (filters.jobType && job.jobType !== filters.jobType) return false
    return true
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'budget_high':
        return b.budget - a.budget
      case 'budget_low':
        return a.budget - b.budget
      case 'urgency':
      default:
        return urgencyOrder[a.urgency as keyof typeof urgencyOrder]
          - urgencyOrder[b.urgency as keyof typeof urgencyOrder]
    }
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      syncUrl(next, activeTab)
      return next
    })
  }

  const handleFilterReset = () => {
    setFilters(EMPTY_FILTERS)
    syncUrl(EMPTY_FILTERS, activeTab)
  }

  const handleTabChange = (tab: 'all' | 'for-you') => {
    setActiveTab(tab)
    syncUrl(filters, tab)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {activeTab === 'all'
              ? `${sortedJobs.length} job${sortedJobs.length !== 1 ? 's' : ''} found${profile?.role === 'jobseeker' ? ' — employment roles' : ''}`
              : 'Jobs matched to your skills'}
          </p>
          {profile?.role === 'employer' && (
            <Link href="/jobs/create">
              <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                <Plus className="h-4 w-4" />
                Post a Job
              </button>
            </Link>
          )}
        </div>

        {/* Tabs — only shown to workers */}
        {profile?.role === 'worker' && (
          <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => handleTabChange('for-you')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'for-you'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              For You
            </button>
          </div>
        )}

        {activeTab === 'for-you' && profile?.role === 'worker' ? (
          <JobsForYouFeed />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-72 flex-shrink-0">
              <div className="sticky top-20 space-y-6">
                <JobFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleFilterReset}
                />
                {profile?.role === 'worker' && user && (
                  <SearchAlerts userId={user.uid} />
                )}
              </div>
            </div>

            <div className="flex-1">
              {sortedJobs.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or{' '}
                    <button onClick={handleFilterReset} className="text-primary-600 hover:underline">
                      clear all filters
                    </button>
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedJobs.map((job) => (
                    <JobCard key={job.id} job={job} showApplyButton={profile?.role === 'jobseeker'} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobsBrowser() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <JobsListContent />
    </Suspense>
  )
}
