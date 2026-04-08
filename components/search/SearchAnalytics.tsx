'use client'
import { useState, useEffect, useCallback } from 'react'
import { BarChart2, Search, TrendingUp, Activity } from 'lucide-react'
import type { SearchAnalytics } from '@/types/search'

interface SearchAnalyticsProps {
  adminUserId: string
}

export default function SearchAnalytics({ adminUserId }: SearchAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SearchAnalytics[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/search/analytics?days=30', {
        headers: { 'x-user-id': adminUserId },
      })
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setAnalytics(data.analytics ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics')
    } finally {
      setLoading(false)
    }
  }, [adminUserId])

  useEffect(() => {
    if (adminUserId) fetchAnalytics()
  }, [adminUserId, fetchAnalytics])

  const totalSearches = analytics.reduce((sum, a) => sum + (a.searchCount ?? 0), 0)

  const popularSearches = analytics
    .flatMap((a) => Object.entries(a.popularSearches ?? {}))
    .reduce<Record<string, number>>((acc, [k, v]) => {
      acc[k] = (acc[k] ?? 0) + v
      return acc
    }, {})

  const trendingSkills = analytics
    .flatMap((a) => Object.entries(a.trendingSkills ?? {}))
    .reduce<Record<string, number>>((acc, [k, v]) => {
      acc[k] = (acc[k] ?? 0) + v
      return acc
    }, {})

  const topSearches = Object.entries(popularSearches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const topSkills = Object.entries(trendingSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const maxCount = Math.max(...analytics.map((a) => a.searchCount), 1)

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading analytics">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse h-32 rounded-lg bg-gray-100 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-blue-500" aria-hidden />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Searches</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSearches.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Search className="h-5 w-5 text-green-500" aria-hidden />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Queries</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Object.keys(popularSearches).length.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Distinct search terms</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-orange-500" aria-hidden />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Trending Skills</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Object.keys(trendingSkills).length.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Skills searched</p>
        </div>
      </div>

      {/* Bar chart – searches per day */}
      {analytics.length > 0 && (
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-5 w-5 text-blue-500" aria-hidden />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Searches Over Time</h2>
          </div>
          <div className="flex items-end gap-1 h-24" role="img" aria-label="Search volume bar chart">
            {[...analytics].reverse().map((a) => {
              const pct = Math.round((a.searchCount / maxCount) * 100)
              return (
                <div
                  key={a.date}
                  title={`${a.date}: ${a.searchCount} searches`}
                  className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular searches */}
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-5 w-5 text-green-500" aria-hidden />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Top Searches</h2>
          </div>
          {topSearches.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <ol className="space-y-1.5" aria-label="Top popular searches">
              {topSearches.map(([term, count], i) => (
                <li key={term} className="flex items-center gap-2">
                  <span className="text-xs font-bold w-5 text-gray-400">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 capitalize truncate">{term}</span>
                  <span className="text-xs text-gray-400 font-mono">{count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Trending skills */}
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-orange-500" aria-hidden />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Trending Skills</h2>
          </div>
          {topSkills.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="flex flex-wrap gap-2" aria-label="Trending skills">
              {topSkills.map(([skill, count]) => (
                <span
                  key={skill}
                  title={`${count} searches`}
                  className="px-3 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30
                    text-orange-700 dark:text-orange-300 capitalize font-medium"
                >
                  {skill} <span className="opacity-60">({count})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
