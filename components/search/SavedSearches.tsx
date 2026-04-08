'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Clock, SlidersHorizontal } from 'lucide-react'
import type { SavedSearch, SearchFilters } from '@/types/search'
import { formatDistanceToNow } from 'date-fns'

interface SavedSearchesProps {
  userId: string
  onSearch: (query: string, filters: SearchFilters) => void
}

export default function SavedSearches({ userId, onSearch }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSearches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/search/saved', {
        headers: { 'x-user-id': userId },
      })
      if (res.ok) {
        const data = await res.json()
        setSearches(data.searches ?? [])
      }
    } catch (err) {
      console.error('fetchSearches error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) fetchSearches()
  }, [userId, fetchSearches])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved search?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/search/saved/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      })
      setSearches((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('delete saved search error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const filterCount = (filters?: SearchFilters) => {
    if (!filters) return 0
    return Object.values(filters).filter((v) =>
      v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
    ).length
  }

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading saved searches">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse h-14 rounded-lg bg-gray-100 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (searches.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400" role="status">
        <Search className="h-10 w-10 mx-auto mb-2 opacity-30" aria-hidden />
        <p className="font-medium text-sm">No saved searches</p>
        <p className="text-xs mt-1">Save a search to quickly run it later</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2" aria-label="Saved searches">
      {searches.map((s) => {
        const fc = filterCount(s.filters)
        return (
          <li key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200
            dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Search className="h-3 w-3" aria-hidden />
                  {s.query || '(any)'}
                </span>
                {fc > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3" aria-hidden />
                    {fc} filter{fc !== 1 ? 's' : ''}
                  </span>
                )}
                {s.lastUsedAt && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatDistanceToNow(new Date(s.lastUsedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSearch(s.query, s.filters ?? {})}
              aria-label={`Run saved search: ${s.name}`}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white
                hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Run
            </button>

            <button
              type="button"
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
              aria-label={`Delete saved search: ${s.name}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
