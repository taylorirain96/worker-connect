'use client'

import { cn } from '@/lib/utils'
import type { PortfolioStats as PortfolioStatsType } from '@/types/reputation'

interface Props {
  stats: PortfolioStatsType
  className?: string
}

export default function PortfolioStats({ stats, className }: Props) {
  const items = [
    { label: 'Total Projects', value: stats.totalProjects, icon: '📂' },
    { label: 'Avg Rating', value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—', icon: '⭐' },
    { label: 'Featured', value: stats.featuredProjects, icon: '🌟' },
    { label: 'Photos', value: stats.totalPhotos, icon: '📸' },
  ]

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {items.map(({ label, value, icon }) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <span className="text-2xl">{icon}</span>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
      ))}

      {stats.categories.length > 0 && (
        <div className="col-span-2 sm:col-span-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((cat) => (
              <span key={cat} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full capitalize">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
