'use client'

import { useEffect, useState } from 'react'
import WorkerCard from '@/components/workers/WorkerCard'
import WorkerFilters from '@/components/workers/WorkerFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Users } from 'lucide-react'
import { getWorkers } from '@/lib/services/workerService'
import type { UserProfile } from '@/types'

interface WorkersListClientProps {
  initialWorkers?: UserProfile[]
}

const EMPTY_FILTERS = {
  search: '',
  location: '',
  category: '',
  minRate: '',
  maxRate: '',
  minRating: '',
  availability: '',
}

export default function WorkersListClient({ initialWorkers = [] }: WorkersListClientProps) {
  const [workers, setWorkers] = useState<UserProfile[]>(initialWorkers)
  const [loading, setLoading] = useState(initialWorkers.length === 0)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  useEffect(() => {
    let cancelled = false
    async function fetchWorkers() {
      setLoading(true)
      try {
        const fetched = await getWorkers()
        if (!cancelled) setWorkers(fetched)
      } catch {
        if (!cancelled) setWorkers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchWorkers()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredWorkers = workers.filter((worker) => {
    if (
      filters.search &&
      !worker.displayName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !worker.bio?.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false
    if (filters.location && !worker.location?.toLowerCase().includes(filters.location.toLowerCase()))
      return false
    if (
      filters.category &&
      !worker.skills?.some((s) => s.toLowerCase().includes(filters.category.toLowerCase()))
    )
      return false
    if (filters.minRate && (worker.hourlyRate || 0) < Number(filters.minRate)) return false
    if (filters.maxRate && (worker.hourlyRate || 0) > Number(filters.maxRate)) return false
    if (filters.minRating && (worker.rating || 0) < Number(filters.minRating)) return false
    if (filters.availability && worker.availability !== filters.availability) return false
    return true
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleFilterReset = () => {
    setFilters(EMPTY_FILTERS)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {loading
          ? 'Loading workers…'
          : `${filteredWorkers.length} skilled worker${filteredWorkers.length !== 1 ? 's' : ''} available`}
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No workers found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or{' '}
                <button onClick={handleFilterReset} className="text-primary-600 hover:underline">
                  clear all filters
                </button>
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredWorkers.map((worker) => (
                <WorkerCard key={worker.uid} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
