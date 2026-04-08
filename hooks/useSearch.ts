'use client'
import { useState, useCallback, useRef } from 'react'
import type { SearchFilters, SearchResponse, SearchSuggestion } from '@/types/search'

interface UseSearchReturn {
  query: string
  filters: SearchFilters
  results: SearchResponse<unknown> | null
  loading: boolean
  error: string | null
  suggestions: SearchSuggestion[]
  showSuggestions: boolean
  search: (query: string, filters?: SearchFilters) => void
  updateFilters: (filters: SearchFilters) => void
  clearSearch: () => void
  fetchSuggestions: (partial: string) => void
  setShowSuggestions: (show: boolean) => void
}

export function useSearch(initialQuery = ''): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResponse<unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestionsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string, f: SearchFilters) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ q, type: 'all' })
      if (f.skills?.length) params.set('skills', f.skills.join(','))
      if (f.minRating !== undefined) params.set('minRating', String(f.minRating))
      if (f.maxRating !== undefined) params.set('maxRating', String(f.maxRating))
      if (f.minHourlyRate !== undefined) params.set('minHourlyRate', String(f.minHourlyRate))
      if (f.maxHourlyRate !== undefined) params.set('maxHourlyRate', String(f.maxHourlyRate))
      if (f.availability) params.set('availability', f.availability)
      if (f.location) params.set('location', f.location)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(
    (q: string, f: SearchFilters = {}) => {
      setQuery(q)
      setFilters(f)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => doSearch(q, f), 300)
    },
    [doSearch]
  )

  const updateFilters = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => doSearch(query, newFilters), 300)
    },
    [query, doSearch]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setFilters({})
    setResults(null)
    setError(null)
    setSuggestions([])
    setShowSuggestions(false)
  }, [])

  const fetchSuggestions = useCallback((partial: string) => {
    if (suggestionsTimerRef.current) clearTimeout(suggestionsTimerRef.current)
    suggestionsTimerRef.current = setTimeout(async () => {
      if (!partial.trim()) {
        setSuggestions([])
        return
      }
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(partial)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions ?? [])
          setShowSuggestions(true)
        }
      } catch {
        // ignore suggestion errors
      }
    }, 200)
  }, [])

  return {
    query,
    filters,
    results,
    loading,
    error,
    suggestions,
    showSuggestions,
    search,
    updateFilters,
    clearSearch,
    fetchSuggestions,
    setShowSuggestions,
  }
}
