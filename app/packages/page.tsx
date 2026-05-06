'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ServicePackageCard from '@/components/servicePackages/ServicePackageCard'
import { JOB_CATEGORIES, NZ_REGIONS } from '@/lib/utils'
import { Package, Search, SlidersHorizontal, X } from 'lucide-react'
import type { ServicePackage } from '@/types'

export default function PackagesBrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filter state synced with URL
  const categoryParam = searchParams.get('category') ?? ''
  const regionParam = searchParams.get('region') ?? ''

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.replace(`/packages?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (categoryParam) qs.set('category', categoryParam)
      if (regionParam) qs.set('region', regionParam)
      qs.set('limit', '60')

      const res = await fetch(`/api/service-packages?${qs.toString()}`)
      if (res.ok) {
        const data = await res.json() as { packages: ServicePackage[] }
        setPackages(data.packages ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [categoryParam, regionParam])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  // Client-side text search
  const filteredPackages = searchQuery
    ? packages.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.workerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : packages

  const hasFilters = !!(categoryParam || regionParam)

  function clearFilters() {
    router.replace('/packages', { scroll: false })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-violet-900 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-4">
              <Package className="h-4 w-4" />
              Instant Book
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Fixed-Price Service Packages
            </h1>
            <p className="text-primary-200 text-base sm:text-lg max-w-xl mx-auto">
              Know exactly what you're paying. Browse packages from verified workers and book instantly — no quoting required.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search packages, services, or workers…"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                hasFilters
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{hasFilters ? ' (active)' : ''}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryParam}
                    onChange={(e) => updateParam('category', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All categories</option>
                    {JOB_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Region
                  </label>
                  <select
                    value={regionParam}
                    onChange={(e) => updateParam('region', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All regions</option>
                    {NZ_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-64"
                />
              ))}
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No packages found</h3>
              <p className="text-sm text-gray-500">
                {hasFilters || searchQuery
                  ? 'Try adjusting your filters or search.'
                  : 'No service packages are available yet. Check back soon!'}
              </p>
              {(hasFilters || searchQuery) && (
                <button
                  type="button"
                  onClick={() => { clearFilters(); setSearchQuery('') }}
                  className="mt-3 text-sm text-primary-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} available
                {categoryParam || regionParam ? ' with selected filters' : ''}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPackages.map((pkg) => (
                  <ServicePackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
