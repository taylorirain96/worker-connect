'use client'
import { Search, X, Trophy } from 'lucide-react'
import { JOB_CATEGORIES, CATEGORY_ICONS } from '@/lib/utils'
import type { CategoryId } from '@/lib/utils'

export type LeaderboardCategory = CategoryId | 'all'

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
  const pill = (active: boolean) =>
    [
      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all',
      active
        ? 'bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.6)]'
        : 'bg-slate-900/70 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400/60 hover:shadow-[0_0_8px_rgba(52,211,153,0.3)]',
    ].join(' ')

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/70 pointer-events-none" />
        <input
          type="text"
          placeholder="SEARCH PLAYER…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-emerald-500/30 bg-slate-900/70 text-emerald-200 placeholder-emerald-500/50 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(34,211,238,0.35)] transition-shadow"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/70 hover:text-emerald-300"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => onCategoryChange('all')} className={pill(selectedCategory === 'all')}>
          <Trophy className="h-3.5 w-3.5" /> Overall
        </button>

        {JOB_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id as CategoryId]
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={pill(selectedCategory === cat.id)}
            >
              <Icon className="h-3.5 w-3.5" /> {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
