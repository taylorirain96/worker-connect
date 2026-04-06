'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2, TrendingUp, Clock, MapPin, Star } from 'lucide-react'
import type { SearchSuggestion } from '@/types/search'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
  className?: string
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search workers, skills, jobs…',
  initialValue = '',
  className = '',
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    setLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setShowSuggestions(true)
      }
    } catch {
      // ignore
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    setActiveIndex(-1)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchSuggestions(v), 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    onSearch(value)
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    setValue(suggestion.text)
    setShowSuggestions(false)
    onSearch(suggestion.text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const SuggestionIcon = ({ type }: { type: SearchSuggestion['type'] }) => {
    switch (type) {
      case 'trending': return <TrendingUp className="h-4 w-4 text-orange-400" aria-hidden />
      case 'recent': return <Clock className="h-4 w-4 text-gray-400" aria-hidden />
      case 'location': return <MapPin className="h-4 w-4 text-blue-400" aria-hidden />
      case 'skill': return <Star className="h-4 w-4 text-yellow-400" aria-hidden />
      default: return <Search className="h-4 w-4 text-gray-400" aria-hidden />
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search
            className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => value.trim() && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            autoComplete="off"
            className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors"
          />
          {loadingSuggestions ? (
            <Loader2 className="absolute right-3 h-5 w-5 text-gray-400 animate-spin" aria-hidden />
          ) : (
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-2 px-2 py-1 rounded text-sm font-medium text-blue-600 dark:text-blue-400
                hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              Go
            </button>
          )}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.type}-${s.text}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                ${i === activeIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
            >
              <SuggestionIcon type={s.type} />
              <span className="text-sm text-gray-800 dark:text-gray-200">{s.text}</span>
              {s.count !== undefined && (
                <span className="ml-auto text-xs text-gray-400">{s.count}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
