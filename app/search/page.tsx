'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Bookmark, X, Users, Briefcase, LayoutGrid } from 'lucide-react'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import SearchResults from '@/components/search/SearchResults'
import SavedSearches from '@/components/search/SavedSearches'
import type { SearchFilters as SearchFiltersType, SearchResult } from '@/types/search'

type TabType = 'all' | 'workers' | 'jobs'

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('type') as TabType) ?? 'all')
  const [filters, setFilters] = useState<SearchFiltersType>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<SearchResult<any>[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [sortBy, setSortBy] = useState('relevance')
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  // TODO: replace with real auth context (e.g., useAuth hook) to get the logged-in user ID
  const [userId] = useState<string | null>(null)

  const updateUrl = useCallback(
    (q: string, type: TabType) => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (type !== 'all') params.set('type', type)
      router.replace(`/search?${params.toString()}`, { scroll: false })
    },
    [router]
  )

  const doSearch = useCallback(
    async (q: string, f: SearchFiltersType, p: number, sort: string, tab: TabType) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ q, page: String(p), pageSize: String(pageSize), sortBy: sort })
        if (tab !== 'all') params.set('type', tab)
        if (f.skills?.length) params.set('skills', f.skills.join(','))
        if (f.minRating !== undefined) params.set('minRating', String(f.minRating))
        if (f.maxRating !== undefined) params.set('maxRating', String(f.maxRating))
        if (f.minHourlyRate !== undefined) params.set('minHourlyRate', String(f.minHourlyRate))
        if (f.maxHourlyRate !== undefined) params.set('maxHourlyRate', String(f.maxHourlyRate))
        if (f.availability) params.set('availability', f.availability)
        if (f.location) params.set('location', f.location)
        if (f.category) params.set('category', f.category)
        if (f.budgetMin !== undefined) params.set('minBudget', String(f.budgetMin))
        if (f.budgetMax !== undefined) params.set('maxBudget', String(f.budgetMax))

        const endpoint = tab === 'workers' ? '/api/search/workers'
          : tab === 'jobs' ? '/api/search/jobs'
          : '/api/search'

        const res = await fetch(`${endpoint}?${params.toString()}`)
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()

        if (tab === 'all') {
          // Combined: merge worker and job results
          const workerResults = (data.workers?.results ?? [])
          const jobResults = (data.jobs?.results ?? [])
          setResults([...workerResults, ...jobResults])
          setTotal((data.workers?.total ?? 0) + (data.jobs?.total ?? 0))
        } else {
          setResults(data.results ?? [])
          setTotal(data.total ?? 0)
        }
      } catch (err) {
        console.error('search error:', err)
      } finally {
        setLoading(false)
      }
    },
    [pageSize]
  )

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q)
      setPage(1)
      updateUrl(q, activeTab)
      doSearch(q, filters, 1, sortBy, activeTab)
    },
    [activeTab, filters, sortBy, doSearch, updateUrl]
  )

  const handleFilterChange = useCallback(
    (newFilters: SearchFiltersType) => {
      setFilters(newFilters)
      setPage(1)
      doSearch(query, newFilters, 1, sortBy, activeTab)
    },
    [query, sortBy, activeTab, doSearch]
  )

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setPage(1)
    updateUrl(query, tab)
    doSearch(query, filters, 1, sortBy, tab)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setPage(1)
    doSearch(query, filters, 1, sort, activeTab)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    doSearch(query, filters, p, sortBy, activeTab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveSearch = async () => {
    if (!userId) return alert('Please log in to save searches')
    const name = prompt('Name this search:')
    if (!name) return
    await fetch('/api/search/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ name, query, filters, resultsCount: total }),
    })
  }

  // Run initial search from URL params
  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    const tab = (searchParams.get('type') as TabType) ?? 'all'
    if (q || tab !== 'all') {
      doSearch(q, {}, 1, 'relevance', tab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <LayoutGrid className="h-4 w-4" aria-hidden /> },
    { id: 'workers', label: 'Workers', icon: <Users className="h-4 w-4" aria-hidden /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" aria-hidden /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <SearchBar
            onSearch={handleSearch}
            initialValue={query}
            placeholder="Search workers, skills, jobs…"
            className="max-w-2xl mx-auto"
          />

          {/* Tabs + actions */}
          <div className="flex items-center justify-between mt-3 gap-2">
            <nav className="flex gap-1" aria-label="Search type tabs" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSearch}
                aria-label="Save this search"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400
                  border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Bookmark className="h-4 w-4" aria-hidden />
                Save
              </button>

              {userId && (
                <button
                  type="button"
                  onClick={() => setShowSaved((v) => !v)}
                  aria-label="View saved searches"
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400
                    border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Saved
                </button>
              )}

              {/* Mobile filter toggle */}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-label={showFilters ? 'Close filters' : 'Open filters'}
                aria-expanded={showFilters}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400
                  border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters sidebar – desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0" aria-label="Search filters">
            <SearchFilters
              filters={filters}
              onChange={handleFilterChange}
              type={activeTab === 'jobs' ? 'jobs' : 'workers'}
            />
          </aside>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div
              className="fixed inset-0 z-40 flex md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Search filters"
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowFilters(false)}
                aria-hidden
              />
              <div className="relative ml-auto w-80 max-w-full h-full bg-white dark:bg-gray-800 overflow-y-auto p-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    aria-label="Close filters"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <SearchFilters
                  filters={filters}
                  onChange={(f) => { handleFilterChange(f); setShowFilters(false) }}
                  type={activeTab === 'jobs' ? 'jobs' : 'workers'}
                />
              </div>
            </div>
          )}

          {/* Results */}
          <main className="flex-1 min-w-0" aria-label="Search results">
            {showSaved && userId && (
              <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Saved Searches</h2>
                <SavedSearches
                  userId={userId}
                  onSearch={(q, f) => { setShowSaved(false); setFilters(f); handleSearch(q) }}
                />
              </div>
            )}

            <SearchResults
              results={results}
              type={activeTab}
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
            />
          </main>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <SearchPageContent />
    </Suspense>
  )
}
