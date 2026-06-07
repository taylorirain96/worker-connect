'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import WorkerCard from '@/components/workers/WorkerCard'
import WorkerFilters from '@/components/workers/WorkerFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Users } from 'lucide-react'
import { getWorkers } from '@/lib/services/workerService'
import type { UserProfile } from '@/types'

const EMPTY_FILTERS = {
  search: '',
  location: '',
  category: '',
  minRate: '',
  maxRate: '',
  minRating: '',
  availability: '',
  verified: '',
  sortBy: '',
}

function WorkersListContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [workers, setWorkers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') ?? '',
    location: searchParams.get('location') ?? '',
    category: searchParams.get('category') ?? '',
    minRate: searchParams.get('minRate') ?? '',
    maxRate: searchParams.get('maxRate') ?? '',
    minRating: searchParams.get('minRating') ?? '',
    availability: searchParams.get('availability') ?? '',
    verified: searchParams.get('verified') ?? '',
    sortBy: searchParams.get('sortBy') ?? '',
  }))

  const syncUrl = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => { if (value) params.set(key, value) })
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  useEffect(() => {
    async function fetchWorkers() {
      setLoading(true)
      try {
        const fetched = await getWorkers()
        setWorkers(fetched)
      } catch {
        setWorkers([])
      } finally {
        setLoading(false)
      }
    }
    fetchWorkers()
  }, [])

  const filteredWorkers = workers.filter((worker) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matchesName = worker.displayName?.toLowerCase().includes(q)
      const matchesBio = worker.bio?.toLowerCase().includes(q)
      const matchesSkill = worker.skills?.some((s) => s.toLowerCase().includes(q))
      if (!matchesName && !matchesBio && !matchesSkill) return false
    }
    if (filters.location && !worker.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.category && !worker.skills?.some((s) => s.toLowerCase().includes(filters.category.toLowerCase()))) return false
    if (filters.minRate && (worker.hourlyRate || 0) < Number(filters.minRate)) return false
    if (filters.maxRate && (worker.hourlyRate || 0) > Number(filters.maxRate)) return false
    if (filters.minRating && (worker.rating || 0) < Number(filters.minRating)) return false
    if (filters.availability && worker.availability !== filters.availability) return false
    if (filters.verified === 'verified' && !worker.verified) return false
    if (filters.verified === 'unverified' && worker.verified) return false
    return true
  })

  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    switch (filters.sortBy) {
      case 'highest_rated':
        return (b.rating ?? 0) - (a.rating ?? 0)
      case 'most_jobs':
        return (b.completedJobs ?? 0) - (a.completedJobs ?? 0)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'rate_low':
        return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0)
      case 'rate_high':
        return (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0)
      default:
        return 0
    }
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      syncUrl(next)
      return next
    })
  }

  const handleFilterReset = () => {
    setFilters(EMPTY_FILTERS)
    syncUrl(EMPTY_FILTERS)
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
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary-600" />
          {sortedWorkers.length} skilled tradie{sortedWorkers.length !== 1 ? 's' : ''} found — browse and message any tradie directly
        </p>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <WorkerFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleFilterReset}
              />
            </div>
          </div>

          <div className="flex-1">
            {sortedWorkers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tradies found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or{' '}
                  <button onClick={handleFilterReset} className="text-primary-600 hover:underline">
                    clear all filters
                  </button>
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedWorkers.map((worker) => (
                  <WorkerCard key={worker.uid} worker={worker} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkersBrowser() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <WorkersListContent />
    </Suspense>
  )
}
