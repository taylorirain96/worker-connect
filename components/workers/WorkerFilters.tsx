'use client'
import { Search, Star } from 'lucide-react'
import { JOB_CATEGORIES, NZ_REGIONS } from '@/lib/utils'
import FilterPanel from '@/components/search/FilterPanel'

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide'

interface WorkerFiltersProps {
  filters: {
    search: string
    location: string
    category: string
    minRate: string
    maxRate: string
    minRating: string
    availability: string
    verified: string
    sortBy: string
  }
  onChange: (key: string, value: string) => void
  onReset: () => void
}

export default function WorkerFilters({ filters, onChange, onReset }: WorkerFiltersProps) {
  const activeCount = Object.values(filters).filter((v) => v !== '').length

  return (
    <FilterPanel activeCount={activeCount} onReset={onReset}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Name, skill or trade..."
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Location — NZ regions */}
      <div>
        <label className={labelCls}>Region</label>
        <select
          value={filters.location}
          onChange={(e) => onChange('location', e.target.value)}
          className={inputCls}
        >
          <option value="">All Regions</option>
          {NZ_REGIONS.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Trade / Category */}
      <div>
        <label className={labelCls}>Trade / Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
          className={inputCls}
        >
          <option value="">All Trades</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      {/* Hourly Rate */}
      <div>
        <label className={labelCls}>Hourly Rate (NZ$)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minRate}
            onChange={(e) => onChange('minRate', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxRate}
            onChange={(e) => onChange('maxRate', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className={labelCls}>Minimum Rating</label>
        <div className="flex gap-2">
          {([0, 3, 3.5, 4, 4.5]).map((rating) => (
            <button
              key={rating}
              type="button"
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

      {/* Availability */}
      <div>
        <label className={labelCls}>Availability</label>
        <select
          value={filters.availability}
          onChange={(e) => onChange('availability', e.target.value)}
          className={inputCls}
        >
          <option value="">Any Availability</option>
          <option value="available">Available Now</option>
          <option value="busy">Busy</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* Verification Status */}
      <div>
        <label className={labelCls}>Verification</label>
        <select
          value={filters.verified}
          onChange={(e) => onChange('verified', e.target.value)}
          className={inputCls}
        >
          <option value="">All Workers</option>
          <option value="verified">✅ Verified Only</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className={labelCls}>Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange('sortBy', e.target.value)}
          className={inputCls}
        >
          <option value="">Best Match</option>
          <option value="highest_rated">Highest Rated ⭐</option>
          <option value="most_jobs">Most Jobs Completed</option>
          <option value="newest">Newest Members</option>
          <option value="rate_low">Rate: Low to High</option>
          <option value="rate_high">Rate: High to Low</option>
        </select>
      </div>
    </FilterPanel>
  )
}
