'use client'
import { Search, MapPin } from 'lucide-react'
import { JOB_CATEGORIES, NZ_REGIONS } from '@/lib/utils'
import FilterPanel from '@/components/search/FilterPanel'

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide'

interface JobFiltersProps {
  filters: {
    search: string
    category: string
    location: string
    budgetMin: string
    budgetMax: string
    urgency: string
    jobType: string
    sortBy: string
  }
  onChange: (key: string, value: string) => void
  onReset: () => void
}

export default function JobFilters({ filters, onChange, onReset }: JobFiltersProps) {
  const activeCount = Object.values(filters).filter((v) => v !== '').length

  return (
    <FilterPanel activeCount={activeCount} onReset={onReset}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Location — NZ regions */}
      <div>
        <label className={labelCls}>
          <MapPin className="inline h-3 w-3 mr-1" />
          Region
        </label>
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

      {/* Category */}
      <div>
        <label className={labelCls}>Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
          className={inputCls}
        >
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className={labelCls}>Job Type</label>
        <select
          value={filters.jobType}
          onChange={(e) => onChange('jobType', e.target.value)}
          className={inputCls}
        >
          <option value="">All Types</option>
          <option value="gig">Gig / One-off Task</option>
          <option value="employment">Employment Role</option>
        </select>
      </div>

      {/* Budget Range */}
      <div>
        <label className={labelCls}>Budget (NZ$)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.budgetMin}
            onChange={(e) => onChange('budgetMin', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.budgetMax}
            onChange={(e) => onChange('budgetMax', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Urgency */}
      <div>
        <label className={labelCls}>Urgency</label>
        <select
          value={filters.urgency}
          onChange={(e) => onChange('urgency', e.target.value)}
          className={inputCls}
        >
          <option value="">Any Urgency</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="emergency">🚨 Emergency</option>
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
          <option value="">Urgency (default)</option>
          <option value="newest">Newest First</option>
          <option value="budget_high">Budget: High to Low</option>
          <option value="budget_low">Budget: Low to High</option>
          <option value="urgency">Urgency: Highest First</option>
        </select>
      </div>
    </FilterPanel>
  )
}
