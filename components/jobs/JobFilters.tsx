'use client'
import { Search, MapPin, Filter, X } from 'lucide-react'
import { JOB_CATEGORIES } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface JobFiltersProps {
  filters: {
    search: string
    category: string
    location: string
    budgetMin: string
    budgetMax: string
    urgency: string
    status: string
  }
  onChange: (key: string, value: string) => void
  onReset: () => void
}

export default function JobFilters({ filters, onChange, onReset }: JobFiltersProps) {
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
          placeholder="Search jobs..."
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
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Budget Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={filters.budgetMin}
            onChange={(e) => onChange('budgetMin', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            placeholder="Max $"
            value={filters.budgetMax}
            onChange={(e) => onChange('budgetMax', e.target.value)}
            className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Urgency
        </label>
        <select
          value={filters.urgency}
          onChange={(e) => onChange('urgency', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any Urgency</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
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
