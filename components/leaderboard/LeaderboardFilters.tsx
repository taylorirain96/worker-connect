'use client'
import { Search, X, Trophy } from 'lucide-react'
import { JOB_CATEGORIES, CATEGORY_ICONS } from '@/lib/utils'
import type { CategoryId } from '@/lib/utils'
import type { JobCategory } from '@/types'

export type LeaderboardCategory = JobCategory | 'all'

interface LeaderboardFiltersProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedCategory: LeaderboardCategory
  onCategoryChange: (cat: LeaderboardCategory) => void
}

export default function LeaderboardFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search workers by name…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 dark:focus:border-indigo-600 placeholder-slate-400 dark:placeholder-slate-500 transition-shadow"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange('all')}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500',
          ].join(' ')}
        >
          <Trophy className="h-3.5 w-3.5" /> Overall
        </button>

        {JOB_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id as CategoryId]
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" /> {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
