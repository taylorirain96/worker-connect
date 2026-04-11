'use client'
import { Search, X, Trophy } from 'lucide-react'
import { JOB_CATEGORIES, CATEGORY_ICONS } from '@/lib/utils'
import type { CategoryId } from '@/lib/utils'
import type { JobCategory } from '@/types'
import Input from '@/components/ui/Input'

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
        <Input
          type="text"
          placeholder="Search workers by name…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
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
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
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
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
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
