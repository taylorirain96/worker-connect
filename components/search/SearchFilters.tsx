'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import type { SearchFilters } from '@/types/search'
import type { JobCategory } from '@/types'

const POPULAR_SKILLS = [
  'plumbing', 'electrical', 'carpentry', 'hvac', 'roofing',
  'landscaping', 'painting', 'flooring', 'cleaning', 'moving',
  'welding', 'masonry', 'drywall', 'tiling', 'general',
]

const JOB_CATEGORIES: JobCategory[] = [
  'plumbing', 'electrical', 'carpentry', 'hvac', 'roofing',
  'landscaping', 'painting', 'flooring', 'cleaning', 'moving', 'general',
]

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'unavailable', label: 'Unavailable' },
]

interface SearchFiltersProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  type?: 'workers' | 'jobs'
}

export default function SearchFilters({ filters, onChange, type = 'workers' }: SearchFiltersProps) {
  const [expanded, setExpanded] = useState(true)

  const activeCount = [
    (filters.skills?.length ?? 0) > 0,
    filters.minRating !== undefined,
    filters.minHourlyRate !== undefined || filters.maxHourlyRate !== undefined,
    !!filters.location,
    !!filters.availability,
    !!filters.category,
    filters.budgetMin !== undefined || filters.budgetMax !== undefined,
  ].filter(Boolean).length

  const update = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch })

  const toggleSkill = (skill: string) => {
    const current = filters.skills ?? []
    const next = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill]
    update({ skills: next })
  }

  const clearAll = () => onChange({})

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold
          text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={expanded}
        aria-controls="filter-panel"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold
              bg-blue-600 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
      </button>

      {expanded && (
        <div id="filter-panel" className="px-4 pb-4 space-y-5">
          {/* Skills */}
          <fieldset>
            <legend className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Skills
            </legend>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.map((skill) => {
                const selected = (filters.skills ?? []).includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={selected}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize
                      ${selected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                      }`}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {/* Rating (workers only) */}
          {type === 'workers' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => update({ minRating: filters.minRating === star ? undefined : star })}
                    aria-pressed={filters.minRating === star}
                    aria-label={`Minimum ${star} star${star > 1 ? 's' : ''}`}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors
                      ${filters.minRating === star
                        ? 'bg-yellow-400 border-yellow-400 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-yellow-400'
                      }`}
                  >
                    {'★'.repeat(star)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hourly rate (workers) */}
          {type === 'workers' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                Hourly Rate ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={filters.minHourlyRate ?? ''}
                  onChange={(e) => update({ minHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                  aria-label="Minimum hourly rate"
                  className="w-24 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={filters.maxHourlyRate ?? ''}
                  onChange={(e) => update({ maxHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                  aria-label="Maximum hourly rate"
                  className="w-24 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Budget (jobs) */}
          {type === 'jobs' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                Budget ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={filters.budgetMin ?? ''}
                  onChange={(e) => update({ budgetMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  aria-label="Minimum budget"
                  className="w-24 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={filters.budgetMax ?? ''}
                  onChange={(e) => update({ budgetMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  aria-label="Maximum budget"
                  className="w-24 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label
              htmlFor="filter-location"
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2"
            >
              Location
            </label>
            <input
              id="filter-location"
              type="text"
              placeholder="City, state or zip"
              value={filters.location ?? ''}
              onChange={(e) => update({ location: e.target.value || undefined })}
              className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Availability (workers) */}
          {type === 'workers' && (
            <div>
              <label
                htmlFor="filter-availability"
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2"
              >
                Availability
              </label>
              <select
                id="filter-availability"
                value={filters.availability ?? ''}
                onChange={(e) => update({ availability: (e.target.value || undefined) as SearchFilters['availability'] })}
                className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category (jobs) */}
          {type === 'jobs' && (
            <div>
              <label
                htmlFor="filter-category"
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2"
              >
                Category
              </label>
              <select
                id="filter-category"
                value={filters.category ?? ''}
                onChange={(e) => update({ category: e.target.value || undefined })}
                className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onChange(filters)}
              className="flex-1 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white
                hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                aria-label="Clear all filters"
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                  text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                  flex items-center gap-1"
              >
                <X className="h-4 w-4" aria-hidden />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
