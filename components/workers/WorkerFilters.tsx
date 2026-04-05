'use client'
import { Search, MapPin, Filter, X, Star } from 'lucide-react'
import { JOB_CATEGORIES } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface WorkerFiltersProps {
  filters: {
    search: string
    location: string
    category: string
    minRate: string
    maxRate: string
    minRating: string
    availability: string
  }
  onChange: (key: string, value: string) => void
  onReset: () => void
}

export default function WorkerFilters({ filters, onChange, onReset }: WorkerFiltersProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        {hasActiveFilters && (
          <button onClick={onReset} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search workers..."
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Location..."
          value={filters.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Skill / Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Skills</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Hourly Rate Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={filters.minRate}
            onChange={(e) => onChange('minRate', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            placeholder="Max $"
            value={filters.maxRate}
            onChange={(e) => onChange('maxRate', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Minimum Rating
        </label>
        <div className="flex gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => onChange('minRating', rating === 0 ? '' : String(rating))}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                (filters.minRating === '' && rating === 0) || filters.minRating === String(rating)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {rating === 0 ? 'Any' : (
                <>
                  <Star className="h-3 w-3 fill-current" />
                  {rating}+
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Availability
        </label>
        <select
          value={filters.availability}
          onChange={(e) => onChange('availability', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any Availability</option>
          <option value="available">Available Now</option>
          <option value="busy">Busy</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" className="w-full" onClick={onReset}>
          Reset Filters
        </Button>
      )}
    </div>
  )
}
